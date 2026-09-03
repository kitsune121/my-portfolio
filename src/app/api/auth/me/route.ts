import { NextResponse } from "next/server";
import { getAuth, getSession } from "@/lib/auth";
import { beginData } from "@/lib/api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await beginData();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    const auth = getAuth();
    return NextResponse.json({
      authenticated: true,
      email: auth.email,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Auth check failed";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
