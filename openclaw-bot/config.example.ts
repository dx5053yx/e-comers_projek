export const openClawConfig = {
  webhookUrl:
    process.env.NEXT_WEBHOOK_URL ??
    "http://localhost:3000/api/webhooks/openclaw",
  webhookSecret: process.env.OPENCLAW_WEBHOOK_SECRET ?? "",
  botApiPort: Number(process.env.OPENCLAW_BOT_API_PORT ?? 3020),
  botApiSecret:
    process.env.OPENCLAW_BOT_API_SECRET ??
    process.env.OPENCLAW_WEBHOOK_SECRET ??
    "",
  sessionPath: process.env.OPENCLAW_SESSION_PATH ?? "./session",
  allowlist: (process.env.OPENCLAW_ALLOWLIST ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
};
