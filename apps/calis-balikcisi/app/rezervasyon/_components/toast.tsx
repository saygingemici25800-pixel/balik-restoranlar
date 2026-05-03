'use client';

import { useEffect } from 'react';
import styles from '../_styles/reservation.module.css';

type Props = {
  message: string | null;
  onDone: () => void;
  duration?: number;
};

export function Toast({ message, onDone, duration = 2800 }: Props) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDone, duration);
    return () => clearTimeout(id);
  }, [message, onDone, duration]);

  if (!message) return null;
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {message}
    </div>
  );
}
