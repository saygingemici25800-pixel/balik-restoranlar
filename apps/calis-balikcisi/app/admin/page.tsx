import { LogOut } from 'lucide-react';
import { readContent } from '@/lib/content/store';
import styles from './admin.module.css';
import { AdminPanel } from './_components/admin-panel';
import { logoutAction } from './giris/actions';

// Panel her açılışta storage'ın güncel halini okur (önbellek yok).
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const result = await readContent();

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.brand}>
            Çalış Balıkçısı{' '}
            <span className={styles.brandMuted}>— Menü Yönetimi</span>
          </h1>
          <form action={logoutAction}>
            <button type="submit" className={styles.btnGhost}>
              <LogOut size={16} aria-hidden="true" />
              Çıkış
            </button>
          </form>
        </div>
      </header>

      <main className={styles.container}>
        <AdminPanel
          initialContent={result.content}
          status={result.status}
          source={result.source}
          loadError={result.status === 'error' ? result.error : null}
        />
      </main>
    </div>
  );
}
