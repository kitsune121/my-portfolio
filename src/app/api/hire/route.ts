import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  addHireRequest,
  getHireRequests,
  saveHireRequests,
} from "@/lib/data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getHireRequests());
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const company = String(body.company || "").trim();
  const budget = String(body.budget || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 }
    );
  }

  const item = addHireRequest({ name, email, company, budget, message });
  return NextResponse.json({
    ok: true,
    hire: item,
    message: "Hire request sent. Koichi will get back to you soon.",
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const id = String(body.id || "");
  const list = getHireRequests();
  const idx = list.findIndex((h) => h.id === id);
  if (idx < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (body.status) list[idx].status = body.status;
  saveHireRequests(list);
  return NextResponse.json({ ok: true, hire: list[idx] });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  saveHireRequests(getHireRequests().filter((h) => h.id !== id));
  return NextResponse.json({ ok: true });
}
