import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAuthRow, saveAuthRow } from "./storage";
import type { AuthData } from "./types";

const COOKIE_NAME = "portfolio_admin_session";
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET || "koichi-portfolio-admin-secret-change-me"
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
  const row = getAuthRow();

  if (!row) {
    const { salt, hash } = hashPassword("Luckystar1221!");
    const initial: AuthData = {
      email: "koichisato049@gmail.com",
      passwordHash: hash,
      salt,
    };
    saveAuth(initial);
    return initial;
  }

  return {
    email: row.email,
    passwordHash: row.password_hash,
    salt: row.salt,
  };
}

export function saveAuth(auth: AuthData) {
  saveAuthRow({
    email: auth.email,
    password_hash: auth.passwordHash,
    salt: auth.salt,
  });
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
