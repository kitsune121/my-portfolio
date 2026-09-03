import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSession } from "@/lib/auth";
import { getStats, recordVisit, setStats } from "@/lib/data";

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

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const stats = setStats(body.visits, body.uniqueVisits);
  return NextResponse.json(stats);
}
