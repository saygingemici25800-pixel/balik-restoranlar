'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLenis } from './lenis-provider';
import styles from './scroll-to-top.module.css';

const SHOW_THRESHOLD = 600;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onScroll = () => {
      setVisible(window.scrollY > SHOW_THRESHOLD);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.button} ${visible ? styles.visible : ''}`}
      aria-label="Sayfanın başına dön"
    >
      <ChevronUp className={styles.icon} aria-hidden="true" />
    </button>
  );
}
