import fs from "fs";
import path from "path";
import { isServerlessRuntime } from "./runtime";

const SEED_DATA_DIR = path.join(process.cwd(), "data");

function getRuntimeDataDir() {
  if (isServerlessRuntime()) {
    return path.join("/tmp", "portfolio-data");
  }
  return SEED_DATA_DIR;
}

function getDbPath() {
  return path.join(getRuntimeDataDir(), "portfolio.db");
}

export type SqliteStatement = {
  run: (...params: unknown[]) => unknown;
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
};

export type SqliteDatabase = {
  exec: (sql: string) => void;
  prepare: (sql: string) => SqliteStatement;
  pragma: (pragma: string) => void;
  transaction: <T>(fn: (arg: T) => void) => (arg: T) => void;
};

declare global {
  // eslint-disable-next-line no-var
  var __portfolioDb: SqliteDatabase | undefined;
}

function readJsonFile<T>(file: string, fallback: T): T {
  const full = path.join(SEED_DATA_DIR, file);
  if (!fs.existsSync(full)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function wrapNodeSqlite(raw: {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    run: (...params: unknown[]) => unknown;
    get: (...params: unknown[]) => unknown;
    all: (...params: unknown[]) => unknown[];
  };
}): SqliteDatabase {
  return {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => {
      const stmt = raw.prepare(sql);
      return {
        run: (...params) => stmt.run(...params),
        get: (...params) => stmt.get(...params),
        all: (...params) => stmt.all(...params),
      };
    },
    pragma: (pragma) => {
      raw.exec(`PRAGMA ${pragma}`);
    },
    transaction: <T>(fn: (arg: T) => void) => {
      return (arg: T) => {
        raw.exec("BEGIN");
        try {
          fn(arg);
          raw.exec("COMMIT");
        } catch (err) {
          try {
            raw.exec("ROLLBACK");
          } catch {
            /* ignore */
          }
          throw err;
        }
      };
    },
  };
}

function openDatabase(dbPath: string): SqliteDatabase {
  // Prefer Node built-in SQLite (no native compile / Visual Studio needed).
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite") as {
      DatabaseSync: new (path: string) => {
        exec: (sql: string) => void;
        prepare: (sql: string) => {
          run: (...params: unknown[]) => unknown;
          get: (...params: unknown[]) => unknown;
          all: (...params: unknown[]) => unknown[];
        };
      };
    };
    return wrapNodeSqlite(new DatabaseSync(dbPath));
  } catch (nodeSqliteErr) {
    try {
      // Fallback for older Node installs with a working better-sqlite3 binary.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require("better-sqlite3") as new (path: string) => {
        exec: (sql: string) => void;
        prepare: (sql: string) => SqliteStatement;
        pragma: (pragma: string) => void;
        transaction: <T>(fn: (arg: T) => void) => (arg: T) => void;
      };
      return new Database(dbPath) as unknown as SqliteDatabase;
    } catch (betterErr) {
      const a = nodeSqliteErr instanceof Error ? nodeSqliteErr.message : String(nodeSqliteErr);
      const b = betterErr instanceof Error ? betterErr.message : String(betterErr);
      throw new Error(
        `SQLite unavailable. node:sqlite: ${a}; better-sqlite3: ${b}. Use Node 22+ or install build tools.`
      );
    }
  }
}

function createSchema(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      openai_api_key TEXT NOT NULL DEFAULT '',
      ai_enabled INTEGER NOT NULL DEFAULT 1,
      ai_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
      ai_welcome TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      visits INTEGER NOT NULL DEFAULT 0,
      unique_visits INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS visitors (
      visitor_key TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '',
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hires (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      budget TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );
  `);
}

function migrateFromJson(db: SqliteDatabase) {
  const migrated = db.prepare("SELECT value FROM kv WHERE key = ?").get("migrated_v1") as
    | { value: string }
    | undefined;
  if (migrated?.value === "1") return;

  const portfolio = readJsonFile<Record<string, unknown>>("portfolio.json", {});
  if (Object.keys(portfolio).length) {
    db.prepare(
      "INSERT INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    ).run("portfolio", JSON.stringify(portfolio));
  }

  const auth = readJsonFile<{ email?: string; passwordHash?: string; salt?: string } | null>(
    "auth.json",
    null
  );
  if (auth?.email && auth.passwordHash && auth.salt) {
    db.prepare(
      "INSERT INTO auth (id, email, password_hash, salt) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash, salt = excluded.salt"
    ).run(auth.email, auth.passwordHash, auth.salt);
  }

  const settings = readJsonFile<{
    openaiApiKey?: string;
    aiEnabled?: boolean;
    aiModel?: string;
    aiWelcome?: string;
  }>("settings.json", {});
  db.prepare(
    `INSERT INTO settings (id, openai_api_key, ai_enabled, ai_model, ai_welcome)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       openai_api_key = CASE WHEN excluded.openai_api_key != '' THEN excluded.openai_api_key ELSE settings.openai_api_key END,
       ai_enabled = excluded.ai_enabled,
       ai_model = excluded.ai_model,
       ai_welcome = excluded.ai_welcome`
  ).run(
    settings.openaiApiKey || "",
    settings.aiEnabled === false ? 0 : 1,
    settings.aiModel || "gpt-4o-mini",
    settings.aiWelcome || ""
  );

  const stats = readJsonFile<{ visits?: number; uniqueVisits?: number }>("stats.json", {});
  db.prepare(
    `INSERT INTO stats (id, visits, unique_visits) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET visits = excluded.visits, unique_visits = excluded.unique_visits`
  ).run(Number(stats.visits) || 0, Number(stats.uniqueVisits) || 0);

  const visitors = readJsonFile<string[]>("visitors.json", []);
  const insertVisitor = db.prepare(
    "INSERT OR IGNORE INTO visitors (visitor_key, created_at) VALUES (?, datetime('now'))"
  );
  for (const key of visitors) {
    if (key) insertVisitor.run(key);
  }

  const reviews = readJsonFile<
    Array<{
      id: string;
      name: string;
      role?: string;
      company?: string;
      rating?: number;
      comment: string;
      avatar?: string;
      approved?: boolean;
      createdAt: string;
    }>
  >("reviews.json", []);
  const insertReview = db.prepare(
    `INSERT OR REPLACE INTO reviews
     (id, name, role, company, rating, comment, avatar, approved, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const r of reviews) {
    insertReview.run(
      r.id,
      r.name,
      r.role || "",
      r.company || "",
      r.rating || 5,
      r.comment,
      r.avatar || "",
      r.approved ? 1 : 0,
      r.createdAt
    );
  }

  const hires = readJsonFile<
    Array<{
      id: string;
      name: string;
      email: string;
      company?: string;
      budget?: string;
      message: string;
      status?: string;
      createdAt: string;
    }>
  >("hires.json", []);
  const insertHire = db.prepare(
    `INSERT OR REPLACE INTO hires
     (id, name, email, company, budget, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const h of hires) {
    insertHire.run(
      h.id,
      h.name,
      h.email,
      h.company || "",
      h.budget || "",
      h.message,
      h.status || "new",
      h.createdAt
    );
  }

  const orders = readJsonFile<
    Array<{
      id: string;
      productId: string;
      productTitle: string;
      price: number;
      currency?: string;
      name: string;
      email: string;
      note?: string;
      status?: string;
      createdAt: string;
    }>
  >("orders.json", []);
  const insertOrder = db.prepare(
    `INSERT OR REPLACE INTO orders
     (id, product_id, product_title, price, currency, name, email, note, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const o of orders) {
    insertOrder.run(
      o.id,
      o.productId,
      o.productTitle,
      o.price,
      o.currency || "USD",
      o.name,
      o.email,
      o.note || "",
      o.status || "new",
      o.createdAt
    );
  }

  db.prepare(
    "INSERT INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run("migrated_v1", "1");
}

export function getSqliteDb(): SqliteDatabase {
  if (global.__portfolioDb) return global.__portfolioDb;

  const runtimeDir = getRuntimeDataDir();
  fs.mkdirSync(runtimeDir, { recursive: true });

  const db = openDatabase(getDbPath());
  db.pragma(`journal_mode = ${isServerlessRuntime() ? "DELETE" : "WAL"}`);
  db.pragma("foreign_keys = ON");
  createSchema(db);
  migrateFromJson(db);

  db.prepare(
    `INSERT INTO settings (id, openai_api_key, ai_enabled, ai_model, ai_welcome)
     VALUES (1, '', 1, 'gpt-4o-mini', '')
     ON CONFLICT(id) DO NOTHING`
  ).run();
  db.prepare(
    `INSERT INTO stats (id, visits, unique_visits) VALUES (1, 0, 0)
     ON CONFLICT(id) DO NOTHING`
  ).run();

  global.__portfolioDb = db;
  return db;
}
