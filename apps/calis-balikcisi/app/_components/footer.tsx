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
              href="https://www.google.com/maps/place/%C3%87al%C4%B1%C5%9F+Bal%C4%B1k%C3%A7%C4%B1s%C4%B1/@36.6630367,29.1033425,17z/data=!3m1!4b1!4m6!3m5!1s0x14c04351f8de4c79:0xf866e29db47e04ae!8m2!3d36.6630325!4d29.1082134!16s%2Fg%2F11jpg_gk6x?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D"
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
