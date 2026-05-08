'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  profileImage: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    platform: 'tripadvisor',
    name: 'tartangal',
    designation: 'Tripadvisor',
    description:
      "Authentic Fish restaurant with fresh ingredients. The grouper kebab was something we'd never tasted before — meaty, moist, melting in the mouth. The waiter's recommendation was perfect. We came back the next night for the same.",
    profileImage:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=220&q=80',
  },
  {
    id: '2',
    platform: 'google',
    name: 'Mehmet K.',
    designation: 'Google',
    description:
      "Fethiye'ye her gittiğimde mutlaka uğradığım yer. Levrek lokum bir başka. Akif Usta'nın elinden çıkan iş belli oluyor — sade, doğru, dürüst.",
    profileImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&q=80',
  },
  {
    id: '3',
    platform: 'tripadvisor',
    name: 'SYBEL E.',
    designation: 'Tripadvisor',
    description:
      "4 aydır Fethiye'deyiz, bu mekanı keşfettiğimizden beri sadece burada yiyoruz. Çok temiz, personel çok güleryüzlü, yemekler çok lezzetli. Kışın da yazın da gönül rahatlığıyla gidebilirsiniz.",
    profileImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&q=80',
  },
  {
    id: '4',
    platform: 'instagram',
    name: '@yemeustasi',
    designation: 'Instagram',
    description:
      "Sahil kenarında, gün batımında, taze balıkla — Fethiye'nin en iyi akşam yemeği adresi. Akif Usta'yla balık üzerine sohbet etmek de ayrı bir keyif.",
    profileImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&q=80',
  },
  {
    id: '5',
    platform: 'google',
    name: 'Ayşe T.',
    designation: 'Google',
    description:
      "Çupra ızgara mükemmeldi, mezeler birbirinden taze. Sahile bakan bahçede oturmak, akşamüstü meltemiyle birlikte yenen bir yemek — Fethiye'de buradan iyisi yok.",
    profileImage:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=220&q=80',
  },
  {
    id: '6',
    platform: 'tripadvisor',
    name: 'Jason B.',
    designation: 'Tripadvisor',
    description:
      'Fish was beautifully cooked, the prawns were huge and meaty with a roasted garlic dip. The team was very helpful explaining the dishes. We booked again before we even left.',
    profileImage:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=220&q=80',
  },
];

const SCROLL_STEP = 336;
const TRUNCATE_AT = 100;

function truncate(text: string): string {
  if (text.length <= TRUNCATE_AT) return text;
  return `${text.slice(0, TRUNCATE_AT).trimEnd()}…`;
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
            <Image
              src={t.profileImage}
              alt={t.name}
              width={110}
              height={110}
              className={styles.profileImage}
            />
            <p className={styles.description}>{truncate(t.description)}</p>
            <p className={styles.name}>{t.name.toLowerCase()}.</p>
            <p className={styles.designation}>
              {t.designation.toLowerCase()}
            </p>
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
                <Image
                  src={activeTestimonial.profileImage}
                  alt={activeTestimonial.name}
                  width={96}
                  height={96}
                  className={styles.modalImage}
                />
                <div className={styles.modalIdentity}>
                  <h3
                    id={`testimonial-name-${activeTestimonial.id}`}
                    className={styles.modalName}
                  >
                    {activeTestimonial.name.toLowerCase()}
                  </h3>
                  <span className={styles.modalDesignation}>
                    {activeTestimonial.designation.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className={styles.modalBody}>
                <Quote size={28} className={styles.modalQuote} />
                <p className={styles.modalDescription}>
                  {activeTestimonial.description.toLowerCase()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
