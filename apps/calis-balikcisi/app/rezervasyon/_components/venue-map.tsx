'use client';

import { useEffect, useRef, useState } from 'react';
import { TABLES_BY_ID } from '../_data/tables';
import { TAKEN_IDS } from '../_data/mock-reservations';
import { getAtmosphereTokens } from '../_lib/atmosphere';
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

export function VenueMap() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY, true);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, false);

  // selected: z-order + panel content (kapatma sonrası 700ms grace ile kalır)
  // flightActive: masa uçuşta mı? (panel açıkken true, kapanınca false → spring-back)
  // panelOpen: panel UI görünür mü?
  const [selected, setSelected] = useState<SelectedTable | null>(null);
  const [flightActive, setFlightActive] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Sahne saati — panel kapalıyken bile yansır. Default 19:00 (gün batımı,
  // mevcut estetik). Time chip'lerinden değişir.
  const [time, setTime] = useState<string>('19:00');
  const closeTimerRef = useRef<number | null>(null);

  const tokens = getAtmosphereTokens(time);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
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
    // eslint-disable-next-line no-console
    console.log('[rezervasyon] draft:', draft);
    setPanelOpen(false);
    setFlightActive(false);
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setSelected(null);
      closeTimerRef.current = null;
    }, SPRING_BACK_MS);
    setToast('Rezervasyon talebiniz alındı, sizi arayacağız.');
  }

  // Atmosphere wrapper'a CSS custom property'leri inline style ile geçir.
  // @property registration sayesinde değişimler 600ms cubic-bezier ile
  // interpolate olur (atmosphereWrapper class transition'ından).
  const atmosphereStyle = {
    '--rez-sky-top': tokens.skyTop,
    '--rez-sky-bottom': tokens.skyBottom,
    '--rez-sand': tokens.sand,
    '--rez-ink': tokens.ink,
    '--rez-wave-stroke': tokens.waveStroke,
    '--rez-table-fill': tokens.tableFill,
  } as React.CSSProperties;

  return (
    <section
      className={`${styles.mapStage} ${styles.atmosphereWrapper}`}
      style={atmosphereStyle}
    >
      <Legend />
      <div className={styles.mapFrame}>
        <IsoMap
          selectedId={selected?.id ?? null}
          flightId={flightActive ? (selected?.id ?? null) : null}
          isDesktop={isDesktop}
          reducedMotion={reducedMotion}
          tokens={tokens}
          onSelect={handleSelect}
        />
      </div>
      <ReservationPanel
        open={panelOpen}
        table={selected}
        time={time}
        onTimeChange={setTime}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </section>
  );
}
