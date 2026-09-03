const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "data");
fs.mkdirSync(dir, { recursive: true });
const dbPath = path.join(dir, "portfolio.db");
const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
db.prepare(
  "INSERT INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
).run("__ping", "ok");
const row = db.prepare("SELECT value FROM kv WHERE key = ?").get("__ping");
console.log("sqlite ok:", row);
db.close();
