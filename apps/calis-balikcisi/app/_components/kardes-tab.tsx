'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { KardesModal } from './kardes-modal';
import styles from './kardes-tab.module.css';

function VerticalText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span key={i} aria-hidden="true" className={styles.verticalChar}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
}

export function KardesTab() {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400, 600], [1, 0.5, 0]);
  const x = useTransform(scrollY, [0, 600], [0, 60]);
  const pointerEvents = useTransform(opacity, (v) =>
    v < 0.05 ? 'none' : 'auto',
  );

  return (
    <>
      <motion.button
        type="button"
        className={styles.kardesTab}
        style={{ x, y: '-50%', opacity, pointerEvents }}
        onClick={() => setIsOpen(true)}
        aria-label="Kardeş mekan: Fethiye Alkolsüz"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <VerticalText text="KARDEŞ MEKAN" className={styles.eyebrow} />
        <VerticalText text="Fethiye Alkolsüz" className={styles.label} />
        <span className={styles.arrow} aria-hidden="true">
          ←
        </span>
      </motion.button>
      <KardesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
