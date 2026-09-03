import { isServerlessRuntime } from "./runtime";
import {
  getJsonStore,
  saveJsonStore,
  type JsonStore,
} from "./json-store";

declare global {
  // eslint-disable-next-line no-var
  var __portfolioHydrated: boolean | undefined;
  // eslint-disable-next-line no-var
  var __portfolioFlushPromise: Promise<void> | undefined;
}

async function getDataBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore("portfolio-data");
}

/**
 * On Netlify, load durable JSON store from Blobs into memory (once per instance).
 * Local SQLite path does not need this.
 */
export async function ensureHydrated() {
  if (!isServerlessRuntime()) return;
  if (global.__portfolioHydrated) return;

  try {
    const blobStore = await getDataBlobStore();
    const raw = await blobStore.get("store", { type: "text" });
    if (raw) {
      const parsed = JSON.parse(raw) as JsonStore;
      global.__portfolioJsonStore = parsed;
    } else {
      // Seed from bundled data/*.json then persist to Blobs
      const seeded = getJsonStore();
      await blobStore.setJSON("store", seeded);
      global.__portfolioJsonStore = seeded;
    }
  } catch (err) {
    // Blobs unavailable (e.g. local without Netlify context) — file /tmp seed still works
    console.warn("[durable] hydrate fallback:", err instanceof Error ? err.message : err);
    getJsonStore();
  }

  global.__portfolioHydrated = true;
}

/** Persist in-memory JSON store to Netlify Blobs (serverless only). */
export async function flushDurable() {
  if (!isServerlessRuntime()) return;
  const store = global.__portfolioJsonStore;
  if (!store) return;

  const run = (async () => {
    try {
      const blobStore = await getDataBlobStore();
      await blobStore.setJSON("store", store);
    } catch (err) {
      console.warn("[durable] flush failed:", err instanceof Error ? err.message : err);
    }
  })();

  global.__portfolioFlushPromise = run;
  await run;
}

/** Call at the start of API/page handlers that touch data. */
export async function ensureReady() {
  await ensureHydrated();
}

/** After mutations on serverless, flush durable storage. */
export async function afterMutation() {
  if (!isServerlessRuntime()) return;
  // Mirror to /tmp via existing save path, then Blobs
  const store = getJsonStore();
  saveJsonStore(store);
  await flushDurable();
}
