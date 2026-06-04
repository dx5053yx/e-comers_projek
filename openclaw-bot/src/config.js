import dotenv from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

const envFiles = [
  process.env.OPENCLAW_ENV_FILE,
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env.local"),
].filter(Boolean);

for (const file of envFiles) {
  if (existsSync(file)) {
    dotenv.config({ path: file, override: false });
  }
}

function parseAllowlist(value) {
  return (value ?? "")
    .split(",")
    .map((item) => normalizePhone(item))
    .filter(Boolean);
}

export function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

export function loadConfig() {
  const webhookUrl =
    process.env.NEXT_WEBHOOK_URL ??
    "http://localhost:3000/api/webhooks/openclaw";
  const webhookSecret = process.env.OPENCLAW_WEBHOOK_SECRET ?? "";
  const businessSlug = process.env.OPENCLAW_BUSINESS_SLUG ?? "";
  const sessionPath = process.env.OPENCLAW_SESSION_PATH ?? "./session";
  const allowlist = parseAllowlist(process.env.OPENCLAW_ALLOWLIST);
  const logLevel = process.env.OPENCLAW_LOG_LEVEL ?? "info";
  const replyGroups = process.env.OPENCLAW_REPLY_GROUPS === "true";
  const botApiPort = Number(process.env.OPENCLAW_BOT_API_PORT ?? 3020);
  const botApiSecret =
    process.env.OPENCLAW_BOT_API_SECRET ?? process.env.OPENCLAW_WEBHOOK_SECRET ?? "";

  return {
    webhookUrl,
    webhookSecret,
    businessSlug,
    sessionPath,
    allowlist,
    logLevel,
    replyGroups,
    botApiPort,
    botApiSecret,
  };
}
