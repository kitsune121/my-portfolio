import { getSettingsRow, saveSettingsRow } from "./storage";

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
  const row = getSettingsRow();
  if (!row) return { ...defaults };

  return {
    openaiApiKey: row.openai_api_key || "",
    aiEnabled: row.ai_enabled === 1,
    aiModel: row.ai_model || defaults.aiModel,
    aiWelcome: row.ai_welcome || "",
  };
}

export function saveSettings(settings: AppSettings) {
  saveSettingsRow({
    openai_api_key: settings.openaiApiKey || "",
    ai_enabled: settings.aiEnabled ? 1 : 0,
    ai_model: settings.aiModel || defaults.aiModel,
    ai_welcome: settings.aiWelcome || "",
  });
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
