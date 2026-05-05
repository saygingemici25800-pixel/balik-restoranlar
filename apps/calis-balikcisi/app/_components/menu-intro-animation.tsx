'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import styles from './menu-intro-animation.module.css';

const ITEMS = [
  { label: 'Taze Taze' },
  { label: 'Sofra' },
  { label: 'Rezervasyon' },
  { label: 'Konuşalım' },
];

type Phase = 'visible' | 'collapsing' | 'done';

export function MenuIntroAnimation() {
  const [phase, setPhase] = useState<Phase>('visible');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const collapseTimer = window.setTimeout(() => setPhase('collapsing'), 3000);
    const doneTimer = window.setTimeout(() => setPhase('done'), 4500);

    return () => {
      window.clearTimeout(collapseTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <ul className={styles.itemList}>
        {ITEMS.map((item, i) => (
          <motion.li
            key={item.label}
            className={styles.item}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
            animate={
              phase === 'collapsing'
                ? {
                    x: -100,
                    y: -i * 40,
                    scale: 0.05,
                    opacity: 0,
                    filter: 'blur(3px)',
                  }
                : { opacity: 1, scale: 1 }
            }
            transition={{
              duration: phase === 'collapsing' ? 0.7 : 0,
              delay: phase === 'collapsing' ? i * 0.15 : 0,
              ease: phase === 'collapsing' ? [0.6, 0, 0.4, 1] : 'linear',
            }}
          >
            {item.label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
