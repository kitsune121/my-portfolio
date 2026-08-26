import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";
import type { AuthData } from "./types";

const COOKIE_NAME = "portfolio_admin_session";
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET || "yuki-portfolio-admin-secret-change-me"
);

export function hashPassword(password: string, salt?: string) {
  const usedSalt = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(password, usedSalt, 64).toString("hex");
  return { salt: usedSalt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const hashed = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, "hex");
  if (hashed.length !== hashBuffer.length) return false;
  return timingSafeEqual(hashed, hashBuffer);
}

export function getAuth(): AuthData {
  const row = getDb()
    .prepare("SELECT email, password_hash, salt FROM auth WHERE id = 1")
    .get() as { email: string; password_hash: string; salt: string } | undefined;

  if (!row) {
    const { salt, hash } = hashPassword("Luckystar1221!");
    const initial: AuthData = {
      email: "nyuki6589@gmail.com",
      passwordHash: hash,
      salt,
    };
    saveAuth(initial);
    return initial;
  }

  // Upgrade previous seed login to the new default credentials
  if (row.email.toLowerCase() === "admin@yuki.dev") {
    const { salt, hash } = hashPassword("Luckystar1221!");
    const next: AuthData = {
      email: "nyuki6589@gmail.com",
      passwordHash: hash,
      salt,
    };
    saveAuth(next);
    return next;
  }

  return {
    email: row.email,
    passwordHash: row.password_hash,
    salt: row.salt,
  };
}

export function saveAuth(auth: AuthData) {
  getDb()
    .prepare(
      `INSERT INTO auth (id, email, password_hash, salt)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         password_hash = excluded.password_hash,
         salt = excluded.salt`
    )
    .run(auth.email, auth.passwordHash, auth.salt);
}

export async function createSession(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export { COOKIE_NAME };
