import type { CSSProperties } from 'react';

import { dmMonoFont, frauncesFont } from '@/lib/fonts';

/**
 * "Ufuk" yazı tipleri: Fraunces ve DM Mono'ya next/font nesnelerinden ulaşılır (global `--font-*`
 * değişkenleri Kalam'a `!important` ile ezili — /menu bu ezmeyle kalır). Ana sayfa kabuğu ve
 * gövdeye taşınan katmanlar (menü sayfası) aynı kapsamı kurar.
 */
type FontVars = CSSProperties & Record<'--ff-display-src' | '--ff-label-src', string>;

export const FONT_VARS: FontVars = {
  '--ff-display-src': frauncesFont.style.fontFamily,
  '--ff-label-src': dmMonoFont.style.fontFamily,
};
