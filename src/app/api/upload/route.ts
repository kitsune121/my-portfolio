import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const maxBytes = 12 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File too large (max 12MB)" }, { status: 400 });
  }

  const rawExt = path.extname(file.name || "").toLowerCase();
  const allowed = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
  ]);
  const ext = allowed.has(rawExt) ? rawExt : ".bin";
  const name = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${name}`, originalName: file.name });
}
