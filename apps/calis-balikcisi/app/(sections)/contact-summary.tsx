import Link from 'next/link';
import Image from 'next/image';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../iletisim/_data';
import styles from './contact-summary.module.css';

export function ContactSummary() {
  const { phone, phoneHref, email, emailHref, address, openingHours } =
    CONTACT_INFO;

  return (
    <section
      id="iletisim"
      className={styles.section}
      aria-labelledby="contact-summary-title"
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className="eyebrow">Konuşalım</span>
          <h2 id="contact-summary-title" className={styles.title}>
            Sahile uğramadan önce, bir el sallayın
          </h2>
          <p className={styles.lede}>
            Telefonun ucunda biz, kapının ardında masanız. Çalış sahili,
            akşamüstü meltemi — gerisini birlikte hallederiz.
          </p>
        </div>

        <div className="mt-10 md:mt-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-fg/5">
            <Image
              src="/web/cephe-gece.webp"
              alt="Çalış Balıkçısı — gece cephesi"
              fill
              sizes="(min-width: 1024px) 72rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className={styles.grid}>
          <a href={phoneHref} className={styles.card}>
            <Phone className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>Telefon</span>
            <span className={styles.value}>{phone}</span>
          </a>

          <a href={emailHref} className={styles.card}>
            <Mail className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>E-posta</span>
            <span className={styles.value}>{email}</span>
          </a>

          <a
            href={address.mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <MapPin className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>Adres</span>
            <span className={styles.value}>
              {address.line1}
              <br />
              {address.line2}
            </span>
            <span className={styles.mapHint}>Haritada aç →</span>
          </a>

          <div className={styles.card}>
            <Clock className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>Açık saatler</span>
            <ul className={styles.hours}>
              {openingHours.map((slot) => (
                <li key={slot.days}>
                  <span className={styles.hoursDay}>{slot.days}</span>
                  <span className={styles.hoursTime}>{slot.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footerRow}>
          <Link href="/iletisim" className={styles.fullLink}>
            İletişim sayfasının tamamı →
          </Link>
        </div>
      </div>
    </section>
  );
}
