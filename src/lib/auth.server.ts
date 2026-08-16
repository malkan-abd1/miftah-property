// Server-only auth helpers: password hashing + signed workspace session tokens.
const ITERATIONS = 100000; // workerd caps PBKDF2 iterations at 100000

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str: string) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "=".repeat((4 - (s.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$${ITERATIONS}$${b64url(salt)}$${b64url(hash)}`;
}

export async function verifyPassword(password: string, stored: string) {
  try {
    const parts = stored.split("$");
    const iterStr = parts[1] ?? String(ITERATIONS);
    const saltStr = parts[2] ?? "";
    const hashStr = parts[3] ?? "";
    const salt = fromB64url(saltStr);
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
      "deriveBits",
    ]);
    const iterations = Math.min(Number(iterStr) || ITERATIONS, ITERATIONS);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
      key,
      256,
    );
    return b64url(new Uint8Array(bits)) === hashStr;
  } catch {
    return false;
  }
}

function secret() {
  return (
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_URL"] ||
    "meftah-dev-secret"
  );
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export type SessionPayload = {
  ws: string;
  code: string;
  role: "manager" | "employee";
  name: string;
  exp: number;
};

export async function signSession(payload: SessionPayload) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload> {
  if (!token) throw new Error("UNAUTHENTICATED");
  const [body, sig] = token.split(".");
  if (!body || !sig) throw new Error("UNAUTHENTICATED");
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body)),
  );
  if (b64url(expected) !== sig) throw new Error("UNAUTHENTICATED");
  const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
  if (payload.exp < Date.now()) throw new Error("SESSION_EXPIRED");
  return payload;
}

export async function requireManager(token: string | undefined | null) {
  const session = await verifySession(token);
  if (session.role !== "manager") throw new Error("FORBIDDEN");
  return session;
}

export function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
