import fs from "fs";
import path from "path";
import { isServerlessRuntime } from "./runtime";

const SEED_DIR = path.join(process.cwd(), "data");

export type JsonAuthRow = {
  email: string;
  password_hash: string;
  salt: string;
};

export type JsonSettingsRow = {
  openai_api_key: string;
  ai_enabled: number;
  ai_model: string;
  ai_welcome: string;
};

export type JsonReviewRow = {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  comment: string;
  avatar: string;
  approved: number;
  created_at: string;
};

export type JsonHireRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
  status: string;
  created_at: string;
};

export type JsonOrderRow = {
  id: string;
  product_id: string;
  product_title: string;
  price: number;
  currency: string;
  name: string;
  email: string;
  note: string;
  status: string;
  created_at: string;
};

export type JsonStore = {
  kv: Record<string, string>;
  auth: JsonAuthRow | null;
  settings: JsonSettingsRow;
  stats: { visits: number; unique_visits: number };
  visitors: string[];
  reviews: JsonReviewRow[];
  hires: JsonHireRow[];
  orders: JsonOrderRow[];
};

declare global {
  // eslint-disable-next-line no-var
  var __portfolioJsonStore: JsonStore | undefined;
}

function getStorePath() {
  const dir = isServerlessRuntime()
    ? path.join("/tmp", "portfolio-data")
    : path.join(SEED_DIR, ".runtime");
  return { dir, file: path.join(dir, "store.json") };
}

function readSeedJson<T>(file: string, fallback: T): T {
  const full = path.join(SEED_DIR, file);
  if (!fs.existsSync(full)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function seedStore(): JsonStore {
  const store: JsonStore = {
    kv: {},
    auth: null,
    settings: {
      openai_api_key: "",
      ai_enabled: 1,
      ai_model: "gpt-4o-mini",
      ai_welcome: "",
    },
    stats: { visits: 0, unique_visits: 0 },
    visitors: [],
    reviews: [],
    hires: [],
    orders: [],
  };

  const portfolio = readSeedJson<Record<string, unknown>>("portfolio.json", {});
  if (Object.keys(portfolio).length) {
    store.kv.portfolio = JSON.stringify(portfolio);
  }

  const auth = readSeedJson<{
    email?: string;
    passwordHash?: string;
    salt?: string;
  } | null>("auth.json", null);
  if (auth?.email && auth.passwordHash && auth.salt) {
    store.auth = {
      email: auth.email,
      password_hash: auth.passwordHash,
      salt: auth.salt,
    };
  }

  const settings = readSeedJson<{
    openaiApiKey?: string;
    aiEnabled?: boolean;
    aiModel?: string;
    aiWelcome?: string;
  }>("settings.json", {});
  store.settings = {
    openai_api_key: settings.openaiApiKey || "",
    ai_enabled: settings.aiEnabled === false ? 0 : 1,
    ai_model: settings.aiModel || "gpt-4o-mini",
    ai_welcome: settings.aiWelcome || "",
  };

  const stats = readSeedJson<{ visits?: number; uniqueVisits?: number }>(
    "stats.json",
    {}
  );
  store.stats = {
    visits: Number(stats.visits) || 0,
    unique_visits: Number(stats.uniqueVisits) || 0,
  };

  store.visitors = readSeedJson<string[]>("visitors.json", []).filter(Boolean);

  store.reviews = readSeedJson<
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
  >("reviews.json", []).map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role || "",
    company: r.company || "",
    rating: r.rating || 5,
    comment: r.comment,
    avatar: r.avatar || "",
    approved: r.approved ? 1 : 0,
    created_at: r.createdAt,
  }));

  store.hires = readSeedJson<
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
  >("hires.json", []).map((h) => ({
    id: h.id,
    name: h.name,
    email: h.email,
    company: h.company || "",
    budget: h.budget || "",
    message: h.message,
    status: h.status || "new",
    created_at: h.createdAt,
  }));

  store.orders = readSeedJson<
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
  >("orders.json", []).map((o) => ({
    id: o.id,
    product_id: o.productId,
    product_title: o.productTitle,
    price: o.price,
    currency: o.currency || "USD",
    name: o.name,
    email: o.email,
    note: o.note || "",
    status: o.status || "new",
    created_at: o.createdAt,
  }));

  return store;
}

function persistStore(store: JsonStore) {
  const { dir, file } = getStorePath();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(store));
}

export function getJsonStore(): JsonStore {
  if (global.__portfolioJsonStore) return global.__portfolioJsonStore;

  const { dir, file } = getStorePath();
  fs.mkdirSync(dir, { recursive: true });

  let store: JsonStore;
  if (fs.existsSync(file)) {
    try {
      store = JSON.parse(fs.readFileSync(file, "utf-8")) as JsonStore;
    } catch {
      store = seedStore();
      persistStore(store);
    }
  } else {
    store = seedStore();
    persistStore(store);
  }

  global.__portfolioJsonStore = store;
  return store;
}

export function saveJsonStore(store: JsonStore) {
  global.__portfolioJsonStore = store;
  persistStore(store);
}
