'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '../giris/actions';
import styles from '../admin.module.css';

const INITIAL: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${styles.btnPrimary} ${styles.authBtn}`}
      disabled={pending}
    >
      {pending ? 'Kontrol ediliyor…' : 'Giriş yap'}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, INITIAL);

  return (
    <form className={styles.authCard} action={formAction}>
      <h1 className={styles.authTitle}>Çalış Balıkçısı</h1>
      <p className={styles.authSub}>Menü Yönetimi — giriş yapın</p>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-password">
          Şifre
        </label>
        <input
          id="admin-password"
          name="password"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-describedby={state.error ? 'admin-login-error' : undefined}
        />
      </div>
      {state.error ? (
        <p id="admin-login-error" className={styles.authError} role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
