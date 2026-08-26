import { getSqliteDb } from "./db-sqlite";
import {
  getJsonStore,
  saveJsonStore,
  type JsonAuthRow,
  type JsonHireRow,
  type JsonOrderRow,
  type JsonReviewRow,
  type JsonSettingsRow,
} from "./json-store";
import { isServerlessRuntime } from "./runtime";

export function getKv<T>(key: string, fallback: T): T {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    const raw = store.kv[key];
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  const row = getSqliteDb().prepare("SELECT value FROM kv WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  if (!row?.value) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function setKv(key: string, value: unknown) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.kv[key] = JSON.stringify(value);
    saveJsonStore(store);
    return;
  }

  getSqliteDb()
    .prepare(
      `INSERT INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .run(key, JSON.stringify(value));
}

export function getAuthRow(): JsonAuthRow | undefined {
  if (isServerlessRuntime()) {
    return getJsonStore().auth || undefined;
  }

  return getSqliteDb()
    .prepare("SELECT email, password_hash, salt FROM auth WHERE id = 1")
    .get() as JsonAuthRow | undefined;
}

export function saveAuthRow(auth: JsonAuthRow) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.auth = auth;
    saveJsonStore(store);
    return;
  }

  getSqliteDb()
    .prepare(
      `INSERT INTO auth (id, email, password_hash, salt)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         password_hash = excluded.password_hash,
         salt = excluded.salt`
    )
    .run(auth.email, auth.password_hash, auth.salt);
}

export function getSettingsRow(): JsonSettingsRow {
  const defaults: JsonSettingsRow = {
    openai_api_key: "",
    ai_enabled: 1,
    ai_model: "gpt-4o-mini",
    ai_welcome: "",
  };

  if (isServerlessRuntime()) {
    return getJsonStore().settings || defaults;
  }

  return (
    (getSqliteDb()
      .prepare(
        "SELECT openai_api_key, ai_enabled, ai_model, ai_welcome FROM settings WHERE id = 1"
      )
      .get() as JsonSettingsRow | undefined) || defaults
  );
}

export function saveSettingsRow(settings: JsonSettingsRow) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.settings = settings;
    saveJsonStore(store);
    return;
  }

  getSqliteDb()
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
      settings.openai_api_key,
      settings.ai_enabled,
      settings.ai_model,
      settings.ai_welcome
    );
}

export function getStatsRow() {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    return {
      visits: store.stats.visits,
      unique_visits: store.stats.unique_visits,
      hireCount: store.hires.length,
    };
  }

  const row = getSqliteDb()
    .prepare("SELECT visits, unique_visits FROM stats WHERE id = 1")
    .get() as { visits: number; unique_visits: number } | undefined;
  const hireRow = getSqliteDb().prepare("SELECT COUNT(*) AS c FROM hires").get() as
    | { c: number }
    | undefined;

  return {
    visits: row?.visits || 0,
    unique_visits: row?.unique_visits || 0,
    hireCount: Number(hireRow?.c) || 0,
  };
}

export function recordVisitRow(visitorKey: string) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.stats.visits += 1;
    if (!store.visitors.includes(visitorKey)) {
      store.visitors.push(visitorKey);
    }
    saveJsonStore(store);
    return;
  }

  const db = getSqliteDb();
  const exists = db
    .prepare("SELECT 1 AS ok FROM visitors WHERE visitor_key = ?")
    .get(visitorKey) as { ok: number } | undefined;

  db.prepare("UPDATE stats SET visits = visits + 1 WHERE id = 1").run();

  if (!exists) {
    db.prepare(
      "INSERT INTO visitors (visitor_key, created_at) VALUES (?, datetime('now'))"
    ).run(visitorKey);
  }
}

export function incrementUniqueVisitsRow() {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.stats.unique_visits += 1;
    saveJsonStore(store);
    return;
  }

  getSqliteDb()
    .prepare("UPDATE stats SET unique_visits = unique_visits + 1 WHERE id = 1")
    .run();
}

export function getReviewRows(): JsonReviewRow[] {
  if (isServerlessRuntime()) {
    return [...getJsonStore().reviews].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
  }

  return getSqliteDb()
    .prepare(
      `SELECT id, name, role, company, rating, comment, avatar, approved, created_at
       FROM reviews ORDER BY datetime(created_at) DESC`
    )
    .all() as JsonReviewRow[];
}

export function saveReviewRows(reviews: JsonReviewRow[]) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.reviews = reviews;
    saveJsonStore(store);
    return;
  }

  const db = getSqliteDb();
  const tx = db.transaction((items: JsonReviewRow[]) => {
    db.prepare("DELETE FROM reviews").run();
    const insert = db.prepare(
      `INSERT INTO reviews
       (id, name, role, company, rating, comment, avatar, approved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const r of items) {
      insert.run(
        r.id,
        r.name,
        r.role,
        r.company,
        r.rating,
        r.comment,
        r.avatar,
        r.approved,
        r.created_at
      );
    }
  });
  tx(reviews);
}

export function insertReviewRow(review: JsonReviewRow) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.reviews.push(review);
    saveJsonStore(store);
    return;
  }

  getSqliteDb()
    .prepare(
      `INSERT INTO reviews
       (id, name, role, company, rating, comment, avatar, approved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      review.id,
      review.name,
      review.role,
      review.company,
      review.rating,
      review.comment,
      review.avatar,
      review.approved,
      review.created_at
    );
}

export function getHireRows(): JsonHireRow[] {
  if (isServerlessRuntime()) {
    return [...getJsonStore().hires].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
  }

  return getSqliteDb()
    .prepare(
      `SELECT id, name, email, company, budget, message, status, created_at
       FROM hires ORDER BY datetime(created_at) DESC`
    )
    .all() as JsonHireRow[];
}

export function saveHireRows(hires: JsonHireRow[]) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.hires = hires;
    saveJsonStore(store);
    return;
  }

  const db = getSqliteDb();
  const tx = db.transaction((items: JsonHireRow[]) => {
    db.prepare("DELETE FROM hires").run();
    const insert = db.prepare(
      `INSERT INTO hires
       (id, name, email, company, budget, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const h of items) {
      insert.run(
        h.id,
        h.name,
        h.email,
        h.company,
        h.budget,
        h.message,
        h.status,
        h.created_at
      );
    }
  });
  tx(hires);
}

export function insertHireRow(hire: JsonHireRow) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.hires.push(hire);
    saveJsonStore(store);
    return;
  }

  getSqliteDb()
    .prepare(
      `INSERT INTO hires
       (id, name, email, company, budget, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      hire.id,
      hire.name,
      hire.email,
      hire.company,
      hire.budget,
      hire.message,
      hire.status,
      hire.created_at
    );
}

export function getOrderRows(): JsonOrderRow[] {
  if (isServerlessRuntime()) {
    return [...getJsonStore().orders].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
  }

  return getSqliteDb()
    .prepare(
      `SELECT id, product_id, product_title, price, currency, name, email, note, status, created_at
       FROM orders ORDER BY datetime(created_at) DESC`
    )
    .all() as JsonOrderRow[];
}

export function saveOrderRows(orders: JsonOrderRow[]) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.orders = orders;
    saveJsonStore(store);
    return;
  }

  const db = getSqliteDb();
  const tx = db.transaction((items: JsonOrderRow[]) => {
    db.prepare("DELETE FROM orders").run();
    const insert = db.prepare(
      `INSERT INTO orders
       (id, product_id, product_title, price, currency, name, email, note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const o of items) {
      insert.run(
        o.id,
        o.product_id,
        o.product_title,
        o.price,
        o.currency,
        o.name,
        o.email,
        o.note,
        o.status,
        o.created_at
      );
    }
  });
  tx(orders);
}

export function insertOrderRow(order: JsonOrderRow) {
  if (isServerlessRuntime()) {
    const store = getJsonStore();
    store.orders.push(order);
    saveJsonStore(store);
    return;
  }

  getSqliteDb()
    .prepare(
      `INSERT INTO orders
       (id, product_id, product_title, price, currency, name, email, note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      order.id,
      order.product_id,
      order.product_title,
      order.price,
      order.currency,
      order.name,
      order.email,
      order.note,
      order.status,
      order.created_at
    );
}

/** Local dev / scripts only — not used on Netlify. */
export function getDb() {
  if (isServerlessRuntime()) {
    throw new Error("SQLite is not available on serverless. Use storage helpers instead.");
  }
  return getSqliteDb();
}
