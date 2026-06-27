'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Quote, X } from 'lucide-react';
import styles from './testimonials.module.css';

type Platform = 'google' | 'tripadvisor' | 'instagram';

type Testimonial = {
  id: string;
  platform: Platform;
  name: string;
  designation: string;
  description: string;
  date: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    platform: 'google',
    name: 'Selin A.',
    designation: 'Google',
    date: '4 hafta önce',
    description:
      'Mertay isimli personelinizden inanılmaz memnun kaldık. Güler yüzü ve işini severek yapması sebebiyle tekrar tekrar geleceğiz. Çok teşekkür ederiz.',
  },
  {
    id: '2',
    platform: 'google',
    name: 'Ahmet Mart',
    designation: 'Google',
    date: '7 ay önce',
    description:
      'Levrek lokum balığın en güzel hali olabilir, çok beğendim. Karides beklentimin çok üzerindeydi. Girit güzeli mezesi çok lezzetliydi. Mekan büyük, ferah, manzara çok güzel. Tavsiye ederim.',
  },
  {
    id: '3',
    platform: 'google',
    name: 'S. D.',
    designation: 'Google',
    date: '5 ay önce',
    description:
      'Çalış Balıkçısı bizim için çok özel bir adres. Her yıl 7-8 kez keyifle geliyoruz, her seferinde en kaliteli şekilde ağırlanıyoruz. Balıklar taze, sunumlar mükemmel. Tüm ekip güler yüzlü ve profesyonel. İyi ki varsınız!',
  },
  {
    id: '4',
    platform: 'google',
    name: 'Mert Yaşar Çetingök',
    designation: 'Google',
    date: '9 ay önce',
    description:
      'Mezeler çok çeşit ve lezzetli. Fesleğenli levrek marin çok çok iyiydi. Kalamar ve karidese bayıldık. Gün batımında orada olursanız çok şanslısınız. Kalabalık olmasına rağmen servis hızlı.',
  },
  {
    id: '5',
    platform: 'google',
    name: 'Yunus Emre Tan',
    designation: 'Google',
    date: '4 hafta önce',
    description:
      'Bir arkadaşımın tavsiyesiyle geldik, en güzel tavsiyelerden biri. Terasın manzarası harika. Can adında Fethiyeli bir arkadaş ilgilendi, kendi yerimizmiş gibi hissettirdi. Tavsiye ederim.',
  },
  {
    id: '6',
    platform: 'google',
    name: 'Sue Bali',
    designation: 'Google',
    date: '1 ay önce',
    description:
      'We had fish soup full of fish and absolutely delicious. The free warm bread was amazing too. Seafood salad, calamari, garlic prawns and a grouper skewer — all so fresh and tasty. Will definitely be back soon.',
  },
];

const SCROLL_STEP = 336;
const TRUNCATE_AT = 100;

function truncate(text: string): string {
  if (text.length <= TRUNCATE_AT) return text;
  return `${text.slice(0, TRUNCATE_AT).trimEnd()}…`;
}

// Foto yok; avatar olarak ismin baş harfi kullanılır.
function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function Testimonials() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const checkScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollLeft = () =>
    carouselRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
  const scrollRight = () =>
    carouselRef.current?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });

  const close = useCallback(() => setActiveId(null), []);

  const activeTestimonial =
    activeId !== null
      ? (TESTIMONIALS.find((t) => t.id === activeId) ?? null)
      : null;

  useEffect(() => {
    if (!activeId) return;
    const scrollY = window.scrollY;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    window.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(
      () => closeBtnRef.current?.focus(),
      80,
    );
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
    };
  }, [activeId, close]);

  return (
    <section className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <span className="eyebrow">Misafirlerimiz</span>
          <h2 id="testimonials-title" className={styles.title}>
            Sofradan sonra söylenenler
          </h2>
        </div>
        <div className={styles.navButtons}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={scrollLeft}
            disabled={!canLeft}
            aria-label="Önceki yorumlar"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={scrollRight}
            disabled={!canRight}
            aria-label="Sonraki yorumlar"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className={styles.carousel}
        onScroll={checkScroll}
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.button
            key={t.id}
            type="button"
            className={styles.card}
            layoutId={`testimonial-${t.id}`}
            onClick={() => setActiveId(t.id)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.55,
              delay: i * 0.2,
              ease: [0.22, 0.9, 0.3, 1],
            }}
            whileHover={{ rotate: 2, scale: 1.02 }}
            aria-haspopup="dialog"
            aria-label={`${t.name} yorumu`}
          >
            <span className={styles.profileImage} aria-hidden="true">
              {initialOf(t.name)}
            </span>
            <p className={styles.description}>{truncate(t.description)}</p>
            <p className={styles.name}>
              {t.name}
              {t.name.trim().endsWith('.') ? '' : '.'}
            </p>
            <p className={styles.designation}>
              {t.designation}
            </p>
            <p className={styles.date}>{t.date}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeTestimonial && (
          <motion.div
            key="testimonial-modal"
            className={styles.modalRoot}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className={styles.modalScrim} aria-hidden="true" />
            <motion.div
              className={styles.modal}
              layoutId={`testimonial-${activeTestimonial.id}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`testimonial-name-${activeTestimonial.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={closeBtnRef}
                type="button"
                className={styles.modalClose}
                onClick={close}
                aria-label="Kapat"
              >
                <X size={20} />
              </button>

              <div className={styles.modalHeader}>
                <span className={styles.modalImage} aria-hidden="true">
                  {initialOf(activeTestimonial.name)}
                </span>
                <div className={styles.modalIdentity}>
                  <h3
                    id={`testimonial-name-${activeTestimonial.id}`}
                    className={styles.modalName}
                  >
                    {activeTestimonial.name}
                  </h3>
                  <span className={styles.modalDesignation}>
                    {activeTestimonial.designation}
                  </span>
                  <span className={styles.date}>{activeTestimonial.date}</span>
                </div>
              </div>

              <div className={styles.modalBody}>
                <Quote size={28} className={styles.modalQuote} />
                <p className={styles.modalDescription}>
                  {activeTestimonial.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
