import fs from "fs";
import path from "path";
import { isServerlessRuntime } from "./runtime";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function mimeFor(ext: string) {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".zip":
      return "application/zip";
    case ".json":
      return "application/json";
    case ".txt":
    case ".md":
    case ".csv":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

async function getUploadBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore("portfolio-uploads");
}

export type SavedMedia = {
  /** UI path used in <img src> — /uploads/... (rewritten to /api/media on Netlify). */
  url: string;
  name: string;
  contentType: string;
};

/** Save UI media: local disk, or Netlify Blobs when serverless. */
export async function saveMediaFile(
  name: string,
  bytes: Buffer,
  originalName?: string
): Promise<SavedMedia> {
  const fileName = path.basename(name);
  const ext = path.extname(fileName).toLowerCase() || path.extname(originalName || "").toLowerCase();
  const contentType = mimeFor(ext);

  if (isServerlessRuntime()) {
    const store = await getUploadBlobStore();
    const ab = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    await store.set(fileName, ab, {
      metadata: { contentType, originalName: originalName || fileName },
    });
  } else {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, fileName), bytes);
  }

  return {
    url: `/uploads/${fileName}`,
    name: fileName,
    contentType,
  };
}

export type MediaResult = {
  bytes: Buffer;
  contentType: string;
  originalName?: string;
} | null;

/** Load UI media by filename for <img> / resume download. */
export async function readMediaFile(name: string): Promise<MediaResult> {
  const fileName = path.basename(name || "");
  if (!fileName || fileName.includes("..")) return null;
  const ext = path.extname(fileName).toLowerCase();

  const localPath = path.join(LOCAL_UPLOAD_DIR, fileName);
  if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
    return {
      bytes: fs.readFileSync(localPath),
      contentType: mimeFor(ext),
      originalName: fileName,
    };
  }

  if (isServerlessRuntime()) {
    try {
      const store = await getUploadBlobStore();
      const withMeta = await store.getWithMetadata(fileName, { type: "arrayBuffer" });
      if (!withMeta?.data) return null;
      return {
        bytes: Buffer.from(withMeta.data),
        contentType: (withMeta.metadata?.contentType as string) || mimeFor(ext),
        originalName: (withMeta.metadata?.originalName as string) || fileName,
      };
    } catch (err) {
      console.warn("[media] blob read failed:", err instanceof Error ? err.message : err);
      return null;
    }
  }

  return null;
}

export { mimeFor };
