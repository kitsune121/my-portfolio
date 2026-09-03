import { NextResponse } from "next/server";
import { readMediaFile } from "@/lib/media-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string }> };

/** Serves uploaded files from disk (local) or Netlify Blobs (serverless). */
export async function GET(_req: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  const fileName = decodeURIComponent(name || "").replace(/[/\\]/g, "");
  if (!fileName) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const media = await readMediaFile(fileName);
  if (!media) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(media.bytes), {
    status: 200,
    headers: {
      "Content-Type": media.contentType,
      "Content-Length": String(media.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
