// Accounts are mobile number + password.
//
// The browser stretches the password with PBKDF2 (see public/js/auth.js) and sends only the
// derived key, because the Workers free plan allows ~10 ms of CPU per request — far too little for
// a slow hash on the server. We store SHA-256(per-user salt || key), so a leaked database still
// costs an attacker the full PBKDF2 work for every guess.

const SESSION_DAYS = 30;
const MAX_FAILS = 8;
const LOCK_MS = 15 * 60 * 1000;
export const COOKIE = 'sid';

const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const randomHex = n => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha256 = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

function sameHex(a, b) {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

export const validKey = k => typeof k === 'string' && /^[0-9a-f]{64}$/.test(k);

export async function createUser(db, { mobile, name, key }) {
  const salt = randomHex(16);
  const hash = await sha256(salt + key);
  const res = await db
    .prepare('INSERT INTO users (mobile, name, pass_hash, pass_salt, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(mobile) DO NOTHING RETURNING id')
    .bind(mobile, name, hash, salt, Date.now())
    .first();
  return res?.id ?? null;
}

// → { id } on success, { locked: true } while locked out, null on wrong mobile/password.
export async function checkLogin(db, mobile, key) {
  const u = await db.prepare('SELECT id, pass_hash, pass_salt, failed_logins, locked_until FROM users WHERE mobile = ?').bind(mobile).first();
  if (!u) return null;
  const now = Date.now();
  if (u.locked_until > now) return { locked: true };
  if (sameHex(await sha256(u.pass_salt + key), u.pass_hash)) {
    if (u.failed_logins) await db.prepare('UPDATE users SET failed_logins = 0, locked_until = 0 WHERE id = ?').bind(u.id).run();
    return { id: u.id };
  }
  const fails = u.failed_logins + 1;
  await db
    .prepare('UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?')
    .bind(fails >= MAX_FAILS ? 0 : fails, fails >= MAX_FAILS ? now + LOCK_MS : 0, u.id)
    .run();
  return null;
}

export async function setPassword(db, userId, key) {
  const salt = randomHex(16);
  await db.prepare('UPDATE users SET pass_hash = ?, pass_salt = ? WHERE id = ?').bind(await sha256(salt + key), salt, userId).run();
}

export async function startSession(db, userId) {
  const token = randomHex(32);
  await db
    .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(token), userId, Date.now() + SESSION_DAYS * 864e5)
    .run();
  return `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
}

export async function endSession(db, token) {
  if (token) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function cookieToken(req) {
  const m = (req.headers.get('Cookie') || '').match(/(?:^|;\s*)sid=([0-9a-f]{64})/);
  return m ? m[1] : '';
}

export async function currentUser(db, req) {
  const token = cookieToken(req);
  if (!token) return null;
  return db
    .prepare('SELECT u.id, u.name, u.mobile FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?')
    .bind(await sha256(token), Date.now())
    .first();
}

export const randomSlug = (n = 8) => {
  const abc = 'abcdefghijkmnpqrstuvwxyz23456789';
  return [...crypto.getRandomValues(new Uint8Array(n))].map(b => abc[b % abc.length]).join('');
};
