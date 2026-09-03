import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import path from "path";
import { randomUUID } from "crypto";
import { saveMediaFile } from "@/lib/media-store";
import { ensureReady } from "@/lib/durable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".pdf",
  ".doc",
  ".docx",
  ".zip",
  ".rar",
  ".7z",
  ".txt",
  ".md",
  ".json",
  ".csv",
]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Files → public/uploads (local) or Netlify Blobs (Netlify).
 * Text/metadata → SQLite locally / durable JSON store on Netlify (via /api/content).
 */
export async function POST(req: Request) {
  try {
    await ensureReady();
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized — please log in again", 401);
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return jsonError("Could not read upload body", 400);
    }

    const file = form.get("file");
    if (!file || typeof file === "string") {
      return jsonError("No file", 400);
    }

    const upload = file as File;
    if (!upload.size) {
      return jsonError("Empty file", 400);
    }
    if (upload.size > MAX_BYTES) {
      return jsonError("File too large (max 12MB)", 400);
    }

    const rawExt = path.extname(upload.name || "").toLowerCase();
    const ext = ALLOWED.has(rawExt) ? rawExt : ".bin";
    const name = `${randomUUID()}${ext}`;
    const bytes = Buffer.from(await upload.arrayBuffer());

    const saved = await saveMediaFile(name, bytes, upload.name || name);

    return NextResponse.json({
      ok: true,
      url: saved.url,
      originalName: upload.name || name,
      storage: process.env.NETLIFY ? "netlify-blobs" : "local-uploads",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload]", detail);
    return jsonError(detail, 500);
  }
}
