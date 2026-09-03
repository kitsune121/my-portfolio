import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { getAuthRow, saveAuthRow } from "./storage";
import type { AuthData } from "./types";

export {
  COOKIE_NAME,
  createSession,
  verifySession,
  getSession,
} from "./session";

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
