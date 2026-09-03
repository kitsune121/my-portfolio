import { NextResponse } from "next/server";
import {
  getAuth,
  getSession,
  hashPassword,
  saveAuth,
  verifyPassword,
} from "@/lib/auth";
import { beginData, endData } from "@/lib/api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await beginData();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const newEmail = body.newEmail
      ? String(body.newEmail).trim().toLowerCase()
      : undefined;

    const auth = getAuth();
    if (!verifyPassword(currentPassword, auth.salt, auth.passwordHash)) {
      return NextResponse.json({ error: "Current password is wrong" }, { status: 400 });
    }

    if (newEmail) {
      auth.email = newEmail;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      const { salt, hash } = hashPassword(newPassword);
      auth.salt = salt;
      auth.passwordHash = hash;
    }

    saveAuth(auth);
    await endData();
    return NextResponse.json({ ok: true, email: auth.email });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Password update failed";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
