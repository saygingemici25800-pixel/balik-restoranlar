import type { CSSProperties, ReactNode } from 'react';

import { dmMonoFont, frauncesFont } from '@/lib/fonts';
import h from '../home.module.css';
import m from '../motion.module.css';
import { RevealObserver } from '../reveal-observer';

/**
 * Ana sayfa sarmalayıcısı: "Ufuk" tasarım sisteminin kapsamı. Fraunces ve DM Mono'ya next/font
 * nesnelerinden ulaşılır (global `--font-*` değişkenleri Kalam'a `!important` ile ezili —
 * /menu bu ezmeyle kalır, burada yeni değişken adları kullanılır).
 */
type FontVars = CSSProperties & Record<'--ff-display-src' | '--ff-label-src', string>;

const FONT_VARS: FontVars = {
  '--ff-display-src': frauncesFont.style.fontFamily,
  '--ff-label-src': dmMonoFont.style.fontFamily,
};

export function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div data-home="" className={`${h.home} ${m.root}`} style={FONT_VARS}>
      {children}
      <RevealObserver />
    </div>
  );
}
