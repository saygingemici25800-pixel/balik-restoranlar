'use client';

import { useEffect, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { TEAM_MEMBERS } from './_team-data';
import styles from './ekibimiz.module.css';

function classes(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ');
}

function activateOnEnterOrSpace(
  e: ReactKeyboardEvent<HTMLDivElement>,
  fn: () => void,
) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

export function Ekibimiz() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const activeMember = TEAM_MEMBERS.find((m) => m.id === activeId);

  const col1 = TEAM_MEMBERS.filter((_, i) => i % 3 === 0);
  const col2 = TEAM_MEMBERS.filter((_, i) => i % 3 === 1);
  const col3 = TEAM_MEMBERS.filter((_, i) => i % 3 === 2);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeId]);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Mutfağın Ardındakiler</span>
        <h2 className={styles.title}>Ekibimiz</h2>
        <div className={styles.titleRule} aria-hidden="true" />
      </div>

      <div className={styles.ekipShowcase}>
        <div className={styles.photoGrid}>
          {[col1, col2, col3].map((col, ci) => (
            <div key={ci} className={styles.photoCol}>
              {col.map((m) => (
                <motion.div
                  key={m.id}
                  layoutId={isMobile ? undefined : `card-${m.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${m.name} — ${m.role}`}
                  className={classes(
                    styles.photoCard,
                    hoveredId === m.id && styles.active,
                    hoveredId && hoveredId !== m.id && styles.dimmed,
                  )}
                  onMouseEnter={() => setHoveredId(m.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(m.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => setActiveId(m.id)}
                  onKeyDown={(e) => activateOnEnterOrSpace(e, () => setActiveId(m.id))}
                >
                  <Image
                    src={m.image}
                    alt={m.name}
                    width={600}
                    height={650}
                    sizes="(max-width: 900px) 33vw, 200px"
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.nameList}>
          {TEAM_MEMBERS.map((m) => (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              aria-label={`${m.name} — ${m.role}`}
              className={classes(
                styles.nameRow,
                hoveredId === m.id && styles.active,
                hoveredId && hoveredId !== m.id && styles.dimmed,
              )}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(m.id)}
              onBlur={() => setHoveredId(null)}
              onClick={() => setActiveId(m.id)}
              onKeyDown={(e) => activateOnEnterOrSpace(e, () => setActiveId(m.id))}
            >
              <div className={styles.nameInner}>
                <span className={styles.square} aria-hidden="true" />
                <span className={styles.nameText}>{m.name}</span>
              </div>
              <p className={styles.roleText}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeMember && (
          <motion.div
            className={styles.modalScrim}
            onClick={() => setActiveId(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="presentation"
          >
            <motion.div
              className={styles.modalCard}
              layoutId={isMobile ? undefined : `card-${activeMember.id}`}
              onClick={(e) => e.stopPropagation()}
              initial={isMobile ? { opacity: 0, scale: 0.95 } : { opacity: 0, scale: 0.92 }}
              animate={isMobile ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { opacity: 0, scale: 0.95 } : { opacity: 0, scale: 0.95 }}
              transition={isMobile ? { duration: 0.2 } : { type: 'spring', stiffness: 280, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-label={activeMember.name}
            >
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setActiveId(null)}
                aria-label="Kapat"
              >
                ×
              </button>

              <div className={styles.modalMedia}>
                <Image
                  src={activeMember.image}
                  alt={activeMember.name}
                  width={1200}
                  height={900}
                  sizes="(max-width: 720px) 100vw, 720px"
                  priority
                />
              </div>

              <div className={styles.modalInfo}>
                <span className={styles.modalRole}>{activeMember.role}</span>
                <h3 className={styles.modalName}>{activeMember.name}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
