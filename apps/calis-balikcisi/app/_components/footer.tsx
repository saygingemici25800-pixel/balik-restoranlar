import { CONTACT } from '@/lib/constants';
import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer} data-global-footer>
      <p className={styles.tagline}>
        Özellikle akşamüstü melteminde rezervasyon iyi olur.
      </p>

      <div className={styles.columns}>
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Çalış Balıkçısı</h3>
          <p>{CONTACT.address}</p>
          <p>Akif Usta</p>
          <p>2014&apos;ten beri</p>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>İletişim</h3>
          <p>
            <a href={CONTACT.mobileHref}>{CONTACT.mobile}</a>
          </p>
          <p>
            <a href={CONTACT.landlineHref}>{CONTACT.landline}</a>
          </p>
          <p>
            <a href={CONTACT.emailHref}>{CONTACT.email}</a>
          </p>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Sosyal</h3>
          <p>
            <a
              href="https://instagram.com/calisbalikcisi"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </p>
          <p>
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Haritalar
            </a>
          </p>
        </div>
      </div>

      <p className={styles.hours}>
        Her gün 12:30 — 01:30
      </p>

      <p className={styles.copyright}>
        © 2026 Çalış Balıkçısı. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
