// Admin oturum token'ı: "<bitiş-ms>.<HMAC-SHA256>". Yalnız Web Crypto kullanır;
// hem middleware (edge) hem server action (node) tarafında çalışır.
// Anahtar ADMIN_PASSWORD'den türetilir: şifre değişince tüm oturumlar düşer.

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(`calis-admin-session:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(secret: string): Promise<string> {
  const expires = String(Date.now() + SESSION_MAX_AGE_SEC * 1000);
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(expires));
  return `${expires}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now()) return false;

  const sigBytes = fromBase64Url(signature);
  if (!sigBytes) return false;
  const key = await hmacKey(secret);
  // subtle.verify sabit zamanlı karşılaştırma yapar.
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(expires));
}
