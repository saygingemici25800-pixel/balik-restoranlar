'use client';

import Link from 'next/link';
import { CONTACT } from '@/lib/constants';
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
          <span className={styles.summaryKey}>Kişi</span>
          <span className={styles.summaryVal}>{people} kişi</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>Tarih</span>
          <span className={styles.summaryVal}>{formattedDate}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>Saat</span>
          <span className={styles.summaryVal}>{time}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryRowFull}`}>
          <span className={styles.summaryKey}>Adınız</span>
          <span className={styles.summaryVal}>{name}</span>
        </div>
      </div>

      <div className={styles.phoneBlock}>
        <a className={styles.phoneLink} href={CONTACT.phoneHref}>
          {CONTACT.phone}
        </a>
        <p className={styles.phoneNote}>
          İptal veya değişiklik için aynı numara — telefonda halledelim.
        </p>
        <p className={styles.manifesto}>
          Ayrılış vaktimiz yoktur — masanız sizindir.
        </p>
      </div>

      <div className={styles.footRow}>
        <Link href="/" className={styles.homeLink}>
          ← Anasayfa
        </Link>
        <span className={styles.dot}>·</span>
        <span className={styles.requestNo}>Talep no {requestNo}</span>
      </div>

      <footer className={styles.compactFooter}>
        <div className={styles.twoCol}>
          <div className={styles.colLeft}>
            <p>{CONTACT.address}</p>
            <p>
              <a
                className={styles.socialBtn}
                href="https://instagram.com/calisbalikcisi"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </p>
            <p>
              <a
                className={styles.socialBtn}
                href={CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Haritalar
              </a>
            </p>
          </div>
          <div className={styles.colRight}>
            <p>
              <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            </p>
            <p>
              <a href={CONTACT.emailHref}>{CONTACT.email}</a>
            </p>
            <p>Her gün 12:00–23:00 · Pazar 12:00–22:00</p>
          </div>
        </div>

        <p className={styles.copyright}>© 2026 Çalış Balıkçısı</p>
      </footer>
    </div>
  );
}
