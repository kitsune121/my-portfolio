import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getContent());
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const content = await req.json();
  saveContent(content);
  return NextResponse.json({ ok: true });
}
