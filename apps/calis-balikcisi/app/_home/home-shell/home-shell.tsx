import type { ReactNode } from 'react';

import { FONT_VARS } from '../font-vars';
import h from '../home.module.css';
import m from '../motion.module.css';
import { RevealObserver } from '../reveal-observer';

/** Ana sayfa sarmalayıcısı: "Ufuk" tasarım sisteminin kapsamı (yazı tipleri `font-vars`). */
export function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div data-home="" className={`${h.home} ${m.root}`} style={FONT_VARS}>
      {children}
      <RevealObserver />
    </div>
  );
}
