import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEYLEN = 64;

/**
 * Hash a plaintext password with scrypt + a per-user random salt.
 * Stored format: `scrypt$<saltHex>$<hashHex>`
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(plain, salt, KEYLEN);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

/**
 * Constant-time verification. Returns false for any malformed stored value
 * rather than throwing, so a corrupt row can never crash a login request.
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (!stored) return false;

  if (stored.startsWith("scrypt$")) {
    const [, salt, hashHex] = stored.split("$");
    if (!salt || !hashHex) return false;
    try {
      const derived = await scrypt(plain, salt, KEYLEN);
      const expected = Buffer.from(hashHex, "hex");
      if (expected.length !== derived.length) return false;
      return timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }

  // Legacy rows seeded before hashing existed. Compare in constant time so we
  // don't leak length/content, then the caller transparently upgrades the hash.
  const a = Buffer.from(plain);
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** True when a stored credential still needs upgrading to scrypt. */
export function isLegacyHash(stored: string): boolean {
  return !!stored && !stored.startsWith("scrypt$");
}

/** Shared password policy, used by register + change-password. */
export function validatePassword(plain: string): string | null {
  if (!plain || plain.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(plain)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(plain)) return "Password must contain at least one number.";
  return null;
}
