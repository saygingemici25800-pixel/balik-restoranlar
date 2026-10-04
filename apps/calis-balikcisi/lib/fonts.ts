/**
 * Sitenin next/font yükleyicileri — tek yerde. Layout `className`'leri değişmeden kullanır
 * (/menu çıktısı aynı); ana sayfa Fraunces ve DM Mono'ya bu nesnelerin `style.fontFamily`'si
 * üzerinden ulaşır (global Kalam `!important` değişken ezmelerine takılmadan).
 */
import { Cormorant_Garamond, DM_Mono, Fraunces, Inter, Newsreader } from 'next/font/google';

export const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const frauncesFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const dmMonoFont = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const newsreaderFont = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  display: 'swap',
});
