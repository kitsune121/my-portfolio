import { afterMutation, ensureReady } from "./durable";

/** Hydrate durable store (Netlify Blobs) before reads/writes. */
export async function beginData() {
  await ensureReady();
}

/** Flush durable store after mutations on Netlify. */
export async function endData() {
  await afterMutation();
}

export async function withData<T>(fn: () => T | Promise<T>): Promise<T> {
  await beginData();
  try {
    return await fn();
  } finally {
    await endData();
  }
}
