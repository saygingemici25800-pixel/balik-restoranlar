import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './admin-session';

// Sunucu tarafı (server component / server action) oturum kontrolleri.

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || undefined;
}

// Uzunluk sızdırmamak için iki taraf da hash'lenip sabit zamanda karşılaştırılır.
export function passwordMatches(input: string, expected: string): boolean {
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, getAdminPassword());
}

// Middleware tek başına yeterli sayılmaz; her server action bunu çağırır.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error('Oturum geçersiz ya da süresi doldu. Yeniden giriş yapın.');
  }
}
