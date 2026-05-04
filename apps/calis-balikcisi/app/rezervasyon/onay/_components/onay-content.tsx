'use client';

import Link from 'next/link';
import styles from '../_styles/onay.module.css';

type Props = {
  tableLabel: string;
  zoneLabel: string;
  formattedDate: string;
  time: string;
  people: number;
  name: string;
  requestNo: string;
};

export function OnayContent({
  tableLabel,
  zoneLabel,
  formattedDate,
  time,
  people,
  name,
  requestNo,
}: Props) {
  return (
    <div className={styles.shell}>
      <svg
        className={styles.coastTop}
        viewBox="0 0 520 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M0 38 Q 60 30 120 36 T 240 36 T 360 36 T 520 32" />
        <path
          d="M0 46 Q 70 42 140 44 T 280 44 T 420 44 T 520 42"
          opacity="0.55"
        />
        <g transform="translate(310 22)">
          <path d="M0 8 L 28 8 L 24 14 L 4 14 Z" fill="currentColor" opacity="0.7" />
          <path d="M14 8 L 14 -4" />
          <path d="M14 -4 L 22 6" />
        </g>
      </svg>

      <svg
        className={styles.fish}
        viewBox="0 0 78 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 20 Q 26 6 50 20 Q 26 34 8 20 Z" />
        <path d="M50 20 L 70 10 L 66 20 L 70 30 Z" />
        <circle cx="20" cy="18" r="1.2" fill="currentColor" />
        <path d="M28 16 Q 34 20 28 24" opacity="0.45" />
      </svg>

      <p className={styles.eyebrow}>Çalış Balıkçısı · Fethiye</p>

      <h1 className={styles.h1}>
        Talebiniz <span className={styles.accent}>alındı.</span>
      </h1>

      <p className={styles.lead}>Birazdan sizi arıyoruz.</p>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>Masa</span>
          <span className={styles.summaryVal}>
            {tableLabel}
            {zoneLabel ? ` — ${zoneLabel}` : ''}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>Tarih</span>
          <span className={styles.summaryVal}>
            {formattedDate} · {time}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>Kişi</span>
          <span className={styles.summaryVal}>{people} kişi</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>İsim</span>
          <span className={styles.summaryVal}>{name}</span>
        </div>
      </div>

      <div className={styles.phoneBlock}>
        <p className={styles.phoneNote}>Aramamızı beklemek istemezseniz —</p>
        <a className={styles.phoneLink} href="tel:+902526143821">
          +90 252 614 38 21
        </a>
      </div>

      <p className={styles.manifesto}>
        Ayrılış vaktimiz yoktur, masanız sizindir. İptal veya değişiklik için
        aynı numarayı arayın.
      </p>

      <div className={styles.footRow}>
        <Link href="/" className={styles.homeLink}>
          ← Anasayfa
        </Link>
        <span className={styles.requestNo}>Talep no {requestNo}</span>
      </div>

      <svg
        className={styles.coastBottom}
        viewBox="0 0 520 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M0 9 Q 60 4 120 9 T 240 9 T 360 9 T 520 7" />
      </svg>
    </div>
  );
}
