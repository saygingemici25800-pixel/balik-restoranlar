import type { Metadata } from 'next';
import styles from '../admin.module.css';
import { LoginForm } from '../_components/login-form';

export const metadata: Metadata = {
  title: 'Giriş — Menü Yönetimi',
};

export default function AdminLoginPage() {
  return (
    <div className={styles.wrap}>
      <main className={styles.authWrap}>
        <LoginForm />
      </main>
    </div>
  );
}
