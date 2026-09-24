'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminPassword, passwordMatches } from '@/lib/admin-guard';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
} from '@/lib/admin-session';

export type LoginState = { error: string | null };

const FAIL_DELAY_MS = 800;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const expected = getAdminPassword();
  if (!expected) {
    console.error('[admin] ADMIN_PASSWORD tanımlı değil; giriş kapalı.');
    return { error: 'Panel yapılandırılmamış: ADMIN_PASSWORD tanımlı değil.' };
  }

  const input = formData.get('password');
  if (typeof input !== 'string' || !passwordMatches(input, expected)) {
    // Kaba kuvvet denemelerini yavaşlatır.
    await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
    return { error: 'Şifre hatalı. Tekrar deneyin.' };
  }

  cookies().set(SESSION_COOKIE, await createSessionToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_MAX_AGE_SEC,
  });
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  cookies().delete({ name: SESSION_COOKIE, path: '/admin' });
  redirect('/admin/giris');
}
