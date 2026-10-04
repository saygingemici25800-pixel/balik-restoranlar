import { CONTACT_INFO } from '@/app/iletisim/_data';
import h from '../home.module.css';

/** İletişim ayrıntıları: üç sütun (adres · saatler · sabit hat + e-posta), üstte ince çizgi. */
export function ContactDetails() {
  const { address, openingHours, landline, landlineHref, email, emailHref } = CONTACT_INFO;
  return (
    <dl className="mt-14 grid gap-y-8 border-t border-[var(--color-line)] pt-8 sm:grid-cols-3 sm:gap-x-8" data-reveal="rise">
      <div>
        <dt className={`${h.label} ${h.sun}`}>Adres</dt>
        <dd className={`${h.body} mt-3`}>
          {address.line1}
          <br />
          {address.line2}
          <br />
          <a href={address.mapHref} target="_blank" rel="noopener noreferrer" className={`${h.link} mt-2 inline-block`}>
            Haritada aç <span aria-hidden="true">↗</span>
            <span className="sr-only"> (Google Haritalar, yeni sekmede açılır)</span>
          </a>
        </dd>
      </div>
      <div>
        <dt className={`${h.label} ${h.sun}`}>Saatler</dt>
        {openingHours.map((s) => (
          <dd key={s.days} className={`${h.body} mt-3`}>
            {s.days}
            <br />
            {s.hours}
          </dd>
        ))}
      </div>
      <div>
        <dt className={`${h.label} ${h.sun}`}>Sabit hat · E-posta</dt>
        <dd className={`${h.body} mt-3`}>
          <a href={landlineHref} className="hover:text-accent">{landline}</a>
          <br />
          <a href={emailHref} className="hover:text-accent">{email}</a>
        </dd>
      </div>
    </dl>
  );
}
