import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { loadConfig, normalizePhone } from "./config.js";

const config = loadConfig();
const logger = pino({ level: config.logLevel });
const seenMessages = new Set();

function requireConfig() {
  const missing = [];

  if (!config.webhookSecret) {
    missing.push("OPENCLAW_WEBHOOK_SECRET");
  }

  if (!config.businessSlug) {
    missing.push("OPENCLAW_BUSINESS_SLUG");
  }

  if (missing.length) {
    logger.error({ missing }, "OpenClaw bot env belum lengkap");
    process.exit(1);
  }
}

function jidToPhone(jid) {
  const raw = String(jid ?? "").split("@")[0];
  const phone = normalizePhone(raw);

  return phone ? `+${phone}` : "";
}

function isGroupJid(jid) {
  return String(jid ?? "").endsWith("@g.us");
}

function rememberMessage(id) {
  if (!id) {
    return false;
  }

  if (seenMessages.has(id)) {
    return true;
  }

  seenMessages.add(id);

  if (seenMessages.size > 500) {
    const [oldest] = seenMessages;
    seenMessages.delete(oldest);
  }

  return false;
}

function unwrapMessage(content) {
  let message = content;

  for (let index = 0; index < 5; index += 1) {
    const next =
      message?.ephemeralMessage?.message ??
      message?.viewOnceMessage?.message ??
      message?.viewOnceMessageV2?.message ??
      message?.documentWithCaptionMessage?.message;

    if (!next) {
      return message;
    }

    message = next;
  }

  return message;
}

function extractText(message) {
  const content = unwrapMessage(message.message);

  return (
    content?.conversation ??
    content?.extendedTextMessage?.text ??
    content?.imageMessage?.caption ??
    content?.videoMessage?.caption ??
    content?.buttonsResponseMessage?.selectedDisplayText ??
    content?.buttonsResponseMessage?.selectedButtonId ??
    content?.listResponseMessage?.title ??
    content?.listResponseMessage?.singleSelectReply?.selectedRowId ??
    ""
  ).trim();
}

function messageTimestampToIso(timestamp) {
  if (!timestamp) {
    return new Date().toISOString();
  }

  const seconds =
    typeof timestamp === "number"
      ? timestamp
      : Number(timestamp?.low ?? timestamp);

  return Number.isFinite(seconds)
    ? new Date(seconds * 1000).toISOString()
    : new Date().toISOString();
}

async function postToWebhook(payload) {
  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openclaw-secret": config.webhookSecret,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { error: text };
  }

  if (!response.ok) {
    const error = new Error(json?.error ?? `Webhook gagal: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return json;
}

async function sendWebhookResponse(sock, remoteJid, originalMessage, response) {
  if (response?.reply) {
    await sock.sendMessage(
      remoteJid,
      { text: response.reply },
      { quoted: originalMessage },
    );
  }

  for (const media of response?.media ?? []) {
    if (media?.type !== "image" || !media?.url) {
      continue;
    }

    await sock.sendMessage(
      remoteJid,
      {
        image: { url: media.url },
        caption: media.caption ?? "",
      },
      { quoted: originalMessage },
    );
  }
}

async function handleIncomingMessage(sock, message) {
  const remoteJid = message.key.remoteJid;

  if (!remoteJid || message.key.fromMe || remoteJid === "status@broadcast") {
    return;
  }

  if (isGroupJid(remoteJid) && !config.replyGroups) {
    return;
  }

  if (rememberMessage(message.key.id)) {
    return;
  }

  const senderJid = isGroupJid(remoteJid)
    ? message.key.participant
    : remoteJid;
  const normalizedSender = normalizePhone(jidToPhone(senderJid));

  if (config.allowlist.length && !config.allowlist.includes(normalizedSender)) {
    logger.info({ from: jidToPhone(senderJid) }, "Pesan dilewati karena tidak ada di allowlist");
    return;
  }

  const text = extractText(message);

  if (!text) {
    logger.info({ from: jidToPhone(senderJid) }, "Pesan tanpa teks/caption dilewati");
    return;
  }

  const payload = {
    businessSlug: config.businessSlug,
    from: jidToPhone(senderJid),
    message: text,
    timestamp: messageTimestampToIso(message.messageTimestamp),
    raw: {
      id: message.key.id,
      remoteJid,
      participant: message.key.participant ?? null,
      pushName: message.pushName ?? null,
    },
  };

  logger.info({ from: payload.from, message: text }, "Mengirim pesan ke webhook SiPandu");

  try {
    const response = await postToWebhook(payload);
    await sendWebhookResponse(sock, remoteJid, message, response);
  } catch (error) {
    logger.error(
      { error: error.message, status: error.status, from: payload.from },
      "Webhook SiPandu gagal",
    );
    await sock.sendMessage(remoteJid, {
      text: "Maaf kak, sistem toko sedang belum bisa memproses pesan. Admin akan cek sebentar ya.",
    });
  }
}

async function start() {
  requireConfig();

  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    browser: ["siPandu", "Chrome", "1.0.0"],
    logger,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    version,
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") {
      return;
    }

    for (const message of messages) {
      await handleIncomingMessage(sock, message);
    }
  });
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("\nScan QR WhatsApp ini dari aplikasi WhatsApp bot:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      logger.info("WhatsApp bot terhubung");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn(
        { statusCode, shouldReconnect },
        "Koneksi WhatsApp tertutup",
      );

      if (shouldReconnect) {
        start().catch((error) => logger.error(error, "Gagal reconnect WhatsApp bot"));
      }
    }
  });
}

start().catch((error) => {
  logger.error(error, "OpenClaw bot gagal start");
  process.exit(1);
});
