import { CONTACT } from '@/lib/constants';

export const CONTACT_INFO = {
  mobile: CONTACT.mobile,
  mobileHref: CONTACT.mobileHref,
  landline: CONTACT.landline,
  landlineHref: CONTACT.landlineHref,
  whatsapp: CONTACT.whatsapp,
  email: CONTACT.email,
  emailHref: CONTACT.emailHref,
  address: {
    line1: 'Foça Mahallesi, 1054. Sokak No:66',
    line2: 'Çalış Sahili, Fethiye / Muğla',
    mapHref: CONTACT.mapsUrl,
  },
  openingHours: [
    { days: 'Pzt — Cum', hours: '12:00 — 23:00' },
    { days: 'Cmt — Paz', hours: '11:00 — 24:00' },
  ],
  mapEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.123!2d29.0817!3d36.6533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDM5JzExLjkiTiAyOcKwMDQnNTQuMSJF!5e0!3m2!1str!2str!4v1700000000000',
};
