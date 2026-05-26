import { existsSync, readFileSync } from "node:fs";

export function loadEnvFile(path = ".env") {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function getOpenAiApiKey() {
  return (
    process.env.OPENAI_API_KEY ??
    process.env.OPEN_AI_KEY ??
    process.env.Open_AI_Key ??
    process.env.open_ai_key
  );
}
