/**
 * Pano kartlarının içeriği (Faz 3) — `ZONE_FRAMES` id'siyle eşlenir. `three` import ETMEZ.
 *
 * Metinler sitenin mevcut kopyasından (hero, atmosfer, menü notu); yeni iddia eklenmez.
 * İletişim bilgisi tek kaynaktan: `app/iletisim/_data.ts` (`CONTACT_INFO`), salt okunur.
 * Zone'da form, talep, masa seçimi YOK (karar 2026-10-01).
 */
import { CONTACT_INFO } from '@/app/iletisim/_data';
import type { FrameId } from '@/lib/zone/frames';

export type BoardImage = { readonly src: string; readonly alt: string };

/**
 * `internal`: site içi sayfa — Zone'u kapatıp gider. `call`: tel: bağlantısı. `external`: yeni
 * sekmede (harita, WhatsApp).
 */
export type BoardAction = {
  readonly label: string;
  readonly href: string;
  readonly kind: 'internal' | 'call' | 'external';
  readonly primary?: boolean;
};

export type BoardFact = { readonly label: string; readonly value: string };

export type BoardContent = {
  readonly images: readonly BoardImage[];
  readonly paragraphs: readonly string[];
  readonly facts?: readonly BoardFact[];
  readonly actions?: readonly BoardAction[];
};

const HOURS = CONTACT_INFO.openingHours.map((h) => `${h.days} ${h.hours}`).join(' · ');

export const BOARD_CONTENT: Record<FrameId, BoardContent> = {
  gunbatimi: {
    images: [
      { src: '/web/gunbatimi-teras.webp', alt: 'Gün batımında terastaki masalar' },
      { src: '/web/teras-manzara.webp', alt: 'Terastan Çalış sahiline manzara' },
    ],
    paragraphs: ['Deniz, dağ ve gün batımında dolu masalar.', 'Her sabah denizden, her akşam sofranıza.'],
  },
  menu: {
    images: [{ src: '/web/meze-detay.webp', alt: 'Soğuk meze tabağı' }],
    paragraphs: [
      'Çiğ ve tuzlamalar, köz üzerinde balık, tatlı vakti.',
      'Soğuk meze tabaklarımızdan, ev yapımı.',
      'Fiyatlar günün taze tezgâhına göre masa başında sunulur.',
    ],
    actions: [{ label: 'Tam menüye git', href: '/menu', kind: 'internal', primary: true }],
  },
  reyon: {
    images: [
      { src: '/web/balik-reyonu-1.webp', alt: 'Balık reyonu: buz üstünde günün balıkları ve meze vitrini' },
      { src: '/web/balik-reyonu-2.webp', alt: 'Balık reyonunun yandan görünümü' },
      { src: '/web/balik-reyonu-3.webp', alt: 'Reyonda günün balıkları' },
      { src: '/web/reyon-detay.webp', alt: 'Reyondan yakın plan' },
    ],
    paragraphs: ['Tezgâhın o günkü tazesi, gözünüzün önünde.', 'Her sabah denizden, her akşam sofranıza.'],
  },
  iletisim: {
    images: [{ src: '/web/cephe-gece.webp', alt: 'Çalış Balıkçısı — gece cephesi' }],
    paragraphs: [],
    facts: [
      { label: 'Çalışma saatleri', value: HOURS },
      { label: 'Adres', value: `${CONTACT_INFO.address.line1}, ${CONTACT_INFO.address.line2}` },
    ],
    actions: [
      { label: `Ara · ${CONTACT_INFO.mobile}`, href: CONTACT_INFO.mobileHref, kind: 'call', primary: true },
      { label: `Ara · ${CONTACT_INFO.landline}`, href: CONTACT_INFO.landlineHref, kind: 'call' },
      { label: "WhatsApp'tan yaz", href: CONTACT_INFO.whatsapp, kind: 'external' },
      { label: 'Yol tarifi', href: CONTACT_INFO.address.mapHref, kind: 'external' },
    ],
  },
};

/** Pano yüzüne koddan çizilen iletişim kartı için satırlar (sahnede okunur, uzaktan da). */
export const CONTACT_CARD_LINES = {
  title: 'Bize Ulaşın',
  phones: [CONTACT_INFO.mobile, CONTACT_INFO.landline],
  hours: HOURS,
} as const;
