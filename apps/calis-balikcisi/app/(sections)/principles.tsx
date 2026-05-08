'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import Image from 'next/image';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import styles from './principles.module.css';

type VakitBase = {
  time: string;
  title: string;
  description: string;
  direction: 'card-left' | 'card-right';
  scrollZoom?: boolean;
};

type Vakit =
  | (VakitBase & { mediaType: 'image'; mediaSrc: string; alt: string })
  | (VakitBase & { mediaType: 'video'; mediaSrc: string; alt: string })
  | (VakitBase & { mediaType: 'placeholder' });

const VAKITLER: Vakit[] = [
  {
    time: '05:30',
    title: 'Taze Tutma',
    description:
      'Mezattan masaya, hiç soğumadan. Sabahın ilk ışığında balık seçilir, buz tabletlerinde tezgâha yerleşir.',
    mediaType: 'image',
    mediaSrc: '/images/principles-1.jpg',
    alt: 'Sabah balık mezadı',
    direction: 'card-left',
  },
  {
    time: '12:00',
    title: 'Az Müdahale',
    description:
      'Balık zaten balık. Tuz, limon, ateş — fazlası gerekmez. Mutfakta sade bir el, çok ihtimam.',
    mediaType: 'image',
    mediaSrc: '/images/principles-2.jpg',
    alt: 'Mutfakta sade hazırlık',
    direction: 'card-right',
  },
  {
    time: '19:00',
    title: 'Doğal Ateş',
    description:
      'Akşam üstü, kömür kor olduğunda balık ateşle tanışır. Ne fazla, ne eksik — saygıyla.',
    mediaType: 'placeholder',
    direction: 'card-left',
    scrollZoom: true,
  },
];

type VakitRowBaseProps = {
  vakit: Vakit;
  rowRef: RefObject<HTMLDivElement>;
  isInView: boolean;
  prefersReducedMotion: boolean | null;
  scale?: MotionValue<number>;
};

function VakitRowBase({
  vakit,
  rowRef,
  isInView,
  prefersReducedMotion,
  scale,
}: VakitRowBaseProps) {
  const isCardLeft = vakit.direction === 'card-left';
  const slide = prefersReducedMotion ? 0 : 100;

  return (
    <div ref={rowRef} className={styles.vakitRow}>
      <motion.div
        className={`${styles.kart} ${
          isCardLeft ? styles.cardLeft : styles.cardRight
        }`}
        initial={{ x: isCardLeft ? -slide : slide, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.8, ease: [0.22, 0.9, 0.3, 1] }}
      >
        <span className={styles.time}>{vakit.time}</span>
        <h3 className={styles.title}>{vakit.title}</h3>
        <p className={styles.description}>{vakit.description}</p>
      </motion.div>

      <motion.div
        className={`${styles.medya} ${
          isCardLeft ? styles.medyaRight : styles.medyaLeft
        }`}
        data-zoom={vakit.scrollZoom ? 'true' : 'false'}
        initial={{ x: isCardLeft ? slide : -slide, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 0.9, 0.3, 1] }}
        style={scale ? { scale } : undefined}
      >
        {vakit.mediaType === 'placeholder' ? (
          <div className={styles.placeholder}>
            <span>video gelecek</span>
          </div>
        ) : vakit.mediaType === 'video' ? (
          <video
            src={vakit.mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            className={styles.media}
          />
        ) : (
          <Image
            src={vakit.mediaSrc}
            alt={vakit.alt}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.media}
          />
        )}
      </motion.div>
    </div>
  );
}

function VakitRowStatic({ vakit }: { vakit: Vakit }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <VakitRowBase
      vakit={vakit}
      rowRef={rowRef}
      isInView={isInView}
      prefersReducedMotion={prefersReducedMotion}
    />
  );
}

function VakitRowZoom({ vakit }: { vakit: Vakit }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start'],
  });
  const scaleValue = useTransform(
    scrollYProgress,
    [0.2, 1],
    [1, isMobile ? 1 : 1.8],
    { clamp: true },
  );
  const scale = prefersReducedMotion ? undefined : scaleValue;

  return (
    <VakitRowBase
      vakit={vakit}
      rowRef={rowRef}
      isInView={isInView}
      prefersReducedMotion={prefersReducedMotion}
      scale={scale}
    />
  );
}

function VakitRow({ vakit }: { vakit: Vakit }) {
  if (vakit.scrollZoom) return <VakitRowZoom vakit={vakit} />;
  return <VakitRowStatic vakit={vakit} />;
}

export function Principles() {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Bir günün üç vakti</span>
        <h2 className={styles.heading}>Az müdahale, çok ihtimam</h2>
      </header>

      <div className={styles.vakitler}>
        {VAKITLER.map((v) => (
          <VakitRow key={v.time} vakit={v} />
        ))}
      </div>
    </section>
  );
}
