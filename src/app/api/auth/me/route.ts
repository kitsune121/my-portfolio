import { NextResponse } from "next/server";
import { getAuth, getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const auth = getAuth();
  return NextResponse.json({
    authenticated: true,
    email: auth.email,
  });
}
