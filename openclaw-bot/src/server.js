import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import http from "node:http";
import path from "node:path";
import pino from "pino";
import { loadConfig, normalizePhone } from "./config.js";

const config = loadConfig();
const logger = pino({ level: config.logLevel });
const sessions = new Map();
const seenMessages = new Set();

function jsonResponse(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function isAuthorized(request) {
  if (!config.botApiSecret) {
    return false;
  }

  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers["x-openclaw-bot-secret"];

  return bearer === config.botApiSecret || headerSecret === config.botApiSecret;
}

function normalizeSlug(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

  if (seenMessages.size > 1000) {
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

function publicSession(session) {
  return {
    businessSlug: session.businessSlug,
    status: session.status,
    qr: session.qr,
    phone: session.phone,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    error: session.error,
  };
}

async function postToWebhook(session, payload) {
  const response = await fetch(session.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openclaw-secret": session.webhookSecret,
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
    await sock.sendMessage(remoteJid, { text: response.reply }, { quoted: originalMessage });
  }

  for (const media of response?.media ?? []) {
    if (media?.type !== "image" || !media?.url) {
      continue;
    }

    await sock.sendMessage(
      remoteJid,
      { image: { url: media.url }, caption: media.caption ?? "" },
      { quoted: originalMessage },
    );
  }
}

async function handleIncomingMessage(session, sock, message) {
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

  const senderJid = isGroupJid(remoteJid) ? message.key.participant : remoteJid;
  const normalizedSender = normalizePhone(jidToPhone(senderJid));

  if (config.allowlist.length && !config.allowlist.includes(normalizedSender)) {
    logger.info({ from: jidToPhone(senderJid), businessSlug: session.businessSlug }, "Pesan dilewati karena tidak ada di allowlist");
    return;
  }

  const text = extractText(message);

  if (!text) {
    return;
  }

  const payload = {
    businessSlug: session.businessSlug,
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

  try {
    const webhookResponse = await postToWebhook(session, payload);
    await sendWebhookResponse(sock, remoteJid, message, webhookResponse);
  } catch (error) {
    logger.error({ error: error.message, businessSlug: session.businessSlug }, "Webhook SiPandu gagal");
    await sock.sendMessage(remoteJid, {
      text: "Sebentar ya kak, sistemnya lagi aku cek. Coba kirim ulang beberapa saat lagi.",
    });
  }
}

async function startSession(input) {
  const businessSlug = normalizeSlug(input.businessSlug);

  if (!businessSlug) {
    throw new Error("businessSlug wajib diisi.");
  }

  const existing = sessions.get(businessSlug);

  if (existing?.status === "connected" || existing?.status === "qr" || existing?.status === "connecting") {
    return existing;
  }

  const session = {
    businessSlug,
    webhookUrl: input.webhookUrl ?? config.webhookUrl,
    webhookSecret: input.webhookSecret ?? config.webhookSecret,
    status: "connecting",
    qr: null,
    phone: null,
    sock: null,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: null,
  };

  sessions.set(businessSlug, session);

  const sessionRoot = config.sessionPath || "./session";
  const sessionPath = path.resolve(sessionRoot, businessSlug);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    browser: ["siPandu", "Chrome", "1.0.0"],
    logger,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    version,
  });

  session.sock = sock;

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") {
      return;
    }

    for (const message of messages) {
      await handleIncomingMessage(session, sock, message);
    }
  });
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    session.updatedAt = new Date().toISOString();

    if (qr) {
      session.qr = qr;
      session.status = "qr";
      session.error = null;
    }

    if (connection === "open") {
      session.status = "connected";
      session.qr = null;
      session.phone = sock.user?.id ? jidToPhone(sock.user.id) : null;
      session.error = null;
      logger.info({ businessSlug }, "WhatsApp session connected");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      session.status = shouldReconnect ? "disconnected" : "logged_out";
      session.error = lastDisconnect?.error?.message ?? null;

      if (shouldReconnect) {
        setTimeout(() => {
          sessions.delete(businessSlug);
          startSession(input).catch((error) => {
            logger.error({ error: error.message, businessSlug }, "Gagal reconnect session");
          });
        }, 3000);
      }
    }
  });

  return session;
}

async function stopSession(businessSlug) {
  const session = sessions.get(businessSlug);

  if (!session) {
    return null;
  }

  session.status = "stopped";
  session.qr = null;
  await session.sock?.logout().catch(() => null);
  session.sock?.end?.(undefined);
  sessions.delete(businessSlug);

  return session;
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (url.pathname === "/health") {
      jsonResponse(response, 200, { ok: true, sessions: sessions.size });
      return;
    }

    if (!isAuthorized(request)) {
      jsonResponse(response, 401, { error: "Invalid bot API secret." });
      return;
    }

    if (request.method === "POST" && url.pathname === "/sessions") {
      const body = await readJson(request);
      const session = await startSession(body);
      jsonResponse(response, 200, { session: publicSession(session) });
      return;
    }

    const match = url.pathname.match(/^\/sessions\/([a-z0-9-]+)$/);

    if (match && request.method === "GET") {
      const session = sessions.get(match[1]);
      jsonResponse(response, 200, { session: session ? publicSession(session) : null });
      return;
    }

    if (match && request.method === "DELETE") {
      const session = await stopSession(match[1]);
      jsonResponse(response, 200, { session: session ? publicSession(session) : null });
      return;
    }

    jsonResponse(response, 404, { error: "Route tidak ditemukan." });
  } catch (error) {
    logger.error({ error: error.message }, "Bot API error");
    jsonResponse(response, 500, { error: error.message });
  }
});

server.listen(config.botApiPort, () => {
  logger.info({ port: config.botApiPort }, "siPandu WhatsApp bot API ready");
});
