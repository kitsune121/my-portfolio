import { getDb } from "./db";

export interface AppSettings {
  openaiApiKey: string;
  aiEnabled: boolean;
  aiModel: string;
  aiWelcome: string;
}

const defaults: AppSettings = {
  openaiApiKey: "",
  aiEnabled: true,
  aiModel: "gpt-4o-mini",
  aiWelcome: "",
};

export function getSettings(): AppSettings {
  const row = getDb()
    .prepare(
      "SELECT openai_api_key, ai_enabled, ai_model, ai_welcome FROM settings WHERE id = 1"
    )
    .get() as
    | {
        openai_api_key: string;
        ai_enabled: number;
        ai_model: string;
        ai_welcome: string;
      }
    | undefined;

  if (!row) return { ...defaults };

  return {
    openaiApiKey: row.openai_api_key || "",
    aiEnabled: row.ai_enabled === 1,
    aiModel: row.ai_model || defaults.aiModel,
    aiWelcome: row.ai_welcome || "",
  };
}

export function saveSettings(settings: AppSettings) {
  getDb()
    .prepare(
      `INSERT INTO settings (id, openai_api_key, ai_enabled, ai_model, ai_welcome)
       VALUES (1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         openai_api_key = excluded.openai_api_key,
         ai_enabled = excluded.ai_enabled,
         ai_model = excluded.ai_model,
         ai_welcome = excluded.ai_welcome`
    )
    .run(
      settings.openaiApiKey || "",
      settings.aiEnabled ? 1 : 0,
      settings.aiModel || defaults.aiModel,
      settings.aiWelcome || ""
    );
}

export function getOpenAIKey(): string {
  const fromEnv = (process.env.OPENAI_API_KEY || "").trim();
  const fromDb = getSettings().openaiApiKey.trim();
  return fromEnv || fromDb;
}

export function maskKey(key: string) {
  if (!key) return "";
  if (key.length < 12) return "••••••••";
  return `${key.slice(0, 7)}••••${key.slice(-4)}`;
}
