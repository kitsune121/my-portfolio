import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getContent, saveContent } from "@/lib/data";
import { beginData, endData } from "@/lib/api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await beginData();
    return NextResponse.json(getContent());
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Failed to load content";
    console.error("[content GET]", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}

/** Saves portfolio text/metadata into SQLite (local) or Netlify durable store. */
export async function PUT(req: Request) {
  try {
    await beginData();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const content = await req.json();
    saveContent(content);
    await endData();
    return NextResponse.json({
      ok: true,
      storage: process.env.NETLIFY ? "netlify-blobs" : "sqlite",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Failed to save content";
    console.error("[content PUT]", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
