'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ALL_TABLES, TABLES_BY_ID } from '../_data/tables';
import { TAKEN_IDS } from '../_data/mock-reservations';
import { getAtmosphereTokens, type TimeKey } from '../_lib/atmosphere';
import type {
  ReservationDraft,
  SelectedTable,
} from '../_types/reservation';
import styles from '../_styles/reservation.module.css';
import { IsoMap } from './iso-map';
import { Legend } from './legend';
import { ReservationPanel } from './reservation-panel';
import { Toast } from './toast';

const DESKTOP_QUERY = '(min-width: 721px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
// Spring-back için z-order'ı (selected last) korumak amacıyla bekleme.
// 600ms spring + 100ms tampon. Bu süre içinde selected null'a inmez,
// böylece DOM'da diğer masaların altına gömülmez.
const SPRING_BACK_MS = 700;

function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

type Props = {
  /** Mobile'da panel açıldığında üst yazıların (brand+intro) gizlenmesini
      shell katmanına bildirir. */
  onHeaderHiddenChange?: (hidden: boolean) => void;
  /** Shell CTA'ından gelen counter; her artışta ilk müsait masa seçilir. */
  autoSelectKey?: number;
};

export function VenueMap({ onHeaderHiddenChange, autoSelectKey = 0 }: Props) {
  const router = useRouter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY, true);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, false);
  const isMobile = !isDesktop;

  const [selected, setSelected] = useState<SelectedTable | null>(null);
  const [flightActive, setFlightActive] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [time, setTime] = useState<TimeKey>('17:30');
  const closeTimerRef = useRef<number | null>(null);

  const tokens = getAtmosphereTokens(time);
  const isPanelOpen = panelOpen && isMobile;

  // Mobile'da panel açıldığında: header gizlenir + isoCanvas full viewport
  // ohlur (CSS variable --canvas-offset = 0). Kapanınca 170px döner.
  useEffect(() => {
    onHeaderHiddenChange?.(isPanelOpen);
    if (typeof document === 'undefined') return;
    if (isPanelOpen) {
      document.documentElement.style.setProperty(
        '--canvas-offset',
        '0px',
      );
    } else {
      document.documentElement.style.removeProperty('--canvas-offset');
    }
  }, [isPanelOpen, onHeaderHiddenChange]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.style.removeProperty('--canvas-offset');
      }
    };
  }, []);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function handleSelect(id: string) {
    if (TAKEN_IDS.has(id)) {
      setToast('Bu masa dolu — başka bir masa seçin.');
      return;
    }
    const t = TABLES_BY_ID[id];
    if (!t) return;
    clearCloseTimer();
    setSelected({ id: t.id, label: t.label, zone: t.zone });
    setFlightActive(true);
    setPanelOpen(true);
  }

  // Shell CTA'ından autoSelectKey artarsa ilk müsait masayı seç. ALL_TABLES
  // sea-öncelikli sırada (SEA_TABLES + INDOOR_TABLES); ilk taken olmayan
  // masa açılır. Hiç müsait yoksa toast bildirir.
  useEffect(() => {
    if (autoSelectKey === 0) return;
    const first = ALL_TABLES.find((t) => !TAKEN_IDS.has(t.id));
    if (first) {
      handleSelect(first.id);
    } else {
      setToast(
        'Şu an tüm masalar dolu. Bizi arayın: 0252 XXX XX XX',
      );
    }
    // handleSelect referansı her render'da yeni; autoSelectKey değişimi
    // tek tetikleyici, exhaustive-deps güvenli olarak skip ediliyor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectKey]);

  function handleClose() {
    setPanelOpen(false);
    setFlightActive(false);
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setSelected(null);
      closeTimerRef.current = null;
    }, SPRING_BACK_MS);
  }

  function handleConfirm(draft: ReservationDraft) {
    const tableMeta = TABLES_BY_ID[draft.tableId];
    const params = new URLSearchParams({
      table: draft.tableId,
      zone: tableMeta?.zone ?? 'sea',
      date: draft.date,
      time: draft.time,
      people: String(draft.partySize),
      name: draft.guestName,
    });
    if (draft.allergyNote) {
      params.set('allergy', draft.allergyNote);
    }
    router.push(`/rezervasyon/onay?${params.toString()}`);
  }

  const atmosphereStyle = {
    '--rez-sky-top': tokens.skyTop,
    '--rez-sky-bottom': tokens.skyBottom,
    '--rez-sand': tokens.sand,
    '--rez-ink': tokens.ink,
    '--rez-wave-stroke': tokens.waveStroke,
    '--rez-table-fill': tokens.tableFill,
  } as React.CSSProperties;

  // Scrim sadece desktop'ta — mobile'da yan panel masaları zaten örtüyor,
  // scrim atmosferin (sky+güneş+ay) önüne perde çekmesin.
  const scrimVisible = panelOpen && isDesktop;

  return (
    <section
      className={`${styles.mapStage} ${styles.atmosphereWrapper}`}
      style={atmosphereStyle}
    >
      {/* Legend mobile'da panel açıkken fade-out (height auto↔0 + opacity).
          Desktop'ta hep görünür. */}
      <motion.div
        animate={{
          opacity: isPanelOpen ? 0 : 1,
          height: isPanelOpen ? 0 : 'auto',
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.3,
          ease: 'easeOut',
        }}
        style={{ overflow: 'hidden' }}
        aria-hidden={isPanelOpen}
      >
        <Legend />
      </motion.div>
      <div className={styles.mapFrame}>
        <IsoMap
          selectedId={selected?.id ?? null}
          flightId={flightActive ? (selected?.id ?? null) : null}
          isDesktop={isDesktop}
          isMobile={isMobile}
          isPanelOpen={isPanelOpen}
          reducedMotion={reducedMotion}
          tokens={tokens}
          timeKey={time}
          onSelect={handleSelect}
        />
      </div>
      <div
        className={`${styles.scrim} ${panelOpen ? styles.open : ''} ${
          scrimVisible ? styles.scrimVisible : ''
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <ReservationPanel
        open={panelOpen}
        isMobile={isMobile}
        table={selected}
        time={time}
        onTimeChange={(t) => setTime(t as TimeKey)}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </section>
  );
}
