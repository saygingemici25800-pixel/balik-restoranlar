'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import styles from './menu-intro-animation.module.css';
import { RES_ENABLED } from '@/lib/flags';

const ITEMS = [
  { label: 'Sofra', sizeStep: 0 },
  ...(RES_ENABLED ? [{ label: 'Rezervasyon', sizeStep: 1 }] : []),
  { label: 'Konuşalım', sizeStep: 2 },
];

type ItemPhase =
  | 'hidden'
  | 'emerging'
  | 'arriving'
  | 'visible'
  | 'morphing'
  | 'flying'
  | 'done';
type Target = { x: number; y: number };

const INITIAL_PHASES: ItemPhase[] = ITEMS.map(() => 'hidden');
const ZERO_TARGETS: Target[] = ITEMS.map(() => ({ x: 0, y: 0 }));

const INITIAL_DELAY = 0;
const EMERGE_DURATION = 700;
const ARRIVE_DURATION = 500;
const ENTER_STAGGER = EMERGE_DURATION;
const VISIBLE_HOLD = 800;
const MORPH_DURATION = 600;
const FLY_DURATION = 800;
const STAGGER = MORPH_DURATION;

export function MenuIntroAnimation() {
  const [phases, setPhases] = useState<ItemPhase[]>(INITIAL_PHASES);
  const [targets, setTargets] = useState<Target[]>(ZERO_TARGETS);
  const [allDone, setAllDone] = useState(false);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hamburger = document.getElementById('hamburger-icon');
    if (hamburger) {
      const hamRect = hamburger.getBoundingClientRect();
      const hamX = hamRect.left + hamRect.width / 2;
      const hamY = hamRect.top + hamRect.height / 2;
      const computed = itemRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: hamX - (r.left + r.width / 2),
          y: hamY - (r.top + r.height / 2),
        };
      });
      setTargets(computed);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    const lastEmergeStart =
      INITIAL_DELAY + (ITEMS.length - 1) * ENTER_STAGGER;
    const allVisibleAt = lastEmergeStart + EMERGE_DURATION + ARRIVE_DURATION;
    const exitStart = allVisibleAt + VISIBLE_HOLD;

    ITEMS.forEach((_, i) => {
      const emergeStart = INITIAL_DELAY + i * ENTER_STAGGER;
      const arriveStart = emergeStart + EMERGE_DURATION;
      const visibleStart = arriveStart + ARRIVE_DURATION;
      const morphStart = exitStart + i * STAGGER;
      const flyStart = morphStart + MORPH_DURATION;

      timers.push(
        setTimeout(() => {
          setPhases((prev) => {
            const next = [...prev];
            next[i] = 'emerging';
            return next;
          });
        }, emergeStart),
      );
      timers.push(
        setTimeout(() => {
          setPhases((prev) => {
            const next = [...prev];
            next[i] = 'arriving';
            return next;
          });
        }, arriveStart),
      );
      timers.push(
        setTimeout(() => {
          setPhases((prev) => {
            const next = [...prev];
            next[i] = 'visible';
            return next;
          });
        }, visibleStart),
      );
      timers.push(
        setTimeout(() => {
          setPhases((prev) => {
            const next = [...prev];
            next[i] = 'morphing';
            return next;
          });
        }, morphStart),
      );
      timers.push(
        setTimeout(() => {
          setPhases((prev) => {
            const next = [...prev];
            next[i] = 'flying';
            return next;
          });
        }, flyStart),
      );
    });

    const lastDoneAt =
      exitStart +
      (ITEMS.length - 1) * STAGGER +
      MORPH_DURATION +
      FLY_DURATION +
      200;

    timers.push(setTimeout(() => setAllDone(true), lastDoneAt));

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (allDone) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <ul className={styles.itemList}>
        {ITEMS.map((item, i) => {
          const phase = phases[i] ?? 'hidden';
          const target = targets[i] ?? { x: 0, y: 0 };

          const animateValues =
            phase === 'hidden'
              ? { opacity: 0, scale: 0.05, x: target.x, y: target.y }
              : phase === 'emerging'
                ? { opacity: 1, scale: 0.15, x: 0, y: 0 }
                : phase === 'arriving'
                  ? { opacity: 1, scale: 1, x: 0, y: 0 }
                  : phase === 'visible'
                    ? { opacity: 1, scale: 1, x: 0, y: 0 }
                    : phase === 'morphing'
                      ? { opacity: 1, scale: 0.15, x: 0, y: 0 }
                      : { opacity: 0, scale: 0.05, x: target.x, y: target.y };

          const duration =
            phase === 'emerging'
              ? 0.7
              : phase === 'arriving'
                ? 0.5
                : phase === 'morphing'
                  ? 0.6
                  : phase === 'flying'
                    ? 0.8
                    : 0;
          const ease =
            phase === 'emerging' || phase === 'flying'
              ? ([0.5, 0, 0.4, 1] as const)
              : 'easeOut';

          return (
            <motion.li
              key={item.label}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={styles.item}
              data-phase={phase}
              data-size={item.sizeStep}
              initial={{ opacity: 0, scale: 0.05, x: 0, y: 0 }}
              animate={animateValues}
              transition={{ duration, ease }}
            >
              <span className={styles.itemText}>{item.label}</span>
              <span className={styles.itemGlow} aria-hidden="true" />
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
