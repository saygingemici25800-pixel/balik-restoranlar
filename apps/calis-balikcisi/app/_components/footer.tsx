import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.tagline}>
        Özellikle akşamüstü melteminde rezervasyon iyi olur.
      </p>

      <div className={styles.columns}>
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Çalış Balıkçısı</h3>
          <p>Çalış Plajı, Fethiye</p>
          <p>Akif Usta</p>
          <p>1987&apos;den beri</p>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>İletişim</h3>
          <p>
            <a href="tel:+902526140000">+90 252 614 XX XX</a>
          </p>
          <p>
            <a href="mailto:info@calisbalikcisi.com">info@calisbalikcisi.com</a>
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
              href="https://maps.google.com/?q=Çalış+Balıkçısı+Fethiye"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Haritalar
            </a>
          </p>
        </div>
      </div>

      <p className={styles.hours}>
        Her gün 12:00 — 23:00 &nbsp;·&nbsp; Pazar 12:00 — 22:00
      </p>

      <p className={styles.copyright}>
        © 2026 Çalış Balıkçısı. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
