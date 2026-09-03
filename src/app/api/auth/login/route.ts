import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSession,
  getAuth,
  verifyPassword,
} from "@/lib/auth";
import { beginData } from "@/lib/api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await beginData();
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const auth = getAuth();
    if (email !== auth.email.toLowerCase()) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (!verifyPassword(password, auth.salt, auth.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSession(auth.email);
    const res = NextResponse.json({ ok: true, email: auth.email });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Login failed";
    console.error("[login]", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
