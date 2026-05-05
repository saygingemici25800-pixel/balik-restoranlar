'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TEAM_MEMBERS } from './_team-data';
import styles from './ekibimiz.module.css';

function classes(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ');
}

export function Ekibimiz() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = TEAM_MEMBERS.filter((_, i) => i % 3 === 0);
  const col2 = TEAM_MEMBERS.filter((_, i) => i % 3 === 1);
  const col3 = TEAM_MEMBERS.filter((_, i) => i % 3 === 2);

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
                <div
                  key={m.id}
                  className={classes(
                    styles.photoCard,
                    hoveredId === m.id && styles.active,
                    hoveredId && hoveredId !== m.id && styles.dimmed,
                  )}
                  onMouseEnter={() => setHoveredId(m.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Image
                    src={m.image}
                    alt={m.name}
                    width={600}
                    height={650}
                    sizes="(max-width: 900px) 33vw, 200px"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.nameList}>
          {TEAM_MEMBERS.map((m) => (
            <div
              key={m.id}
              className={classes(
                styles.nameRow,
                hoveredId === m.id && styles.active,
                hoveredId && hoveredId !== m.id && styles.dimmed,
              )}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
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
    </section>
  );
}
