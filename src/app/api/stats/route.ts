import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getStats, recordVisit } from "@/lib/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const track = searchParams.get("track") === "1";

  if (!track) {
    return NextResponse.json(getStats());
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  const ua = req.headers.get("user-agent") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const visitorKey = createHash("sha256")
    .update(`${ip}|${ua}|${day}`)
    .digest("hex")
    .slice(0, 24);

  const stats = recordVisit(visitorKey);
  return NextResponse.json(stats);
}
