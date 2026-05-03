'use client';

import { motion, type Transition } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { INDOOR_TABLES, SEA_TABLES } from '../_data/tables';
import { RECOMMENDED_IDS, TAKEN_IDS } from '../_data/mock-reservations';
import type { Table, TableStatus } from '../_types/reservation';
import styles from '../_styles/reservation.module.css';

const VB_W = 760;
const VB_H = 380;
const VB_X_MIN = -VB_W / 2; // -380
const VB_Y_MIN = -VB_H / 2; // -190
const ENTRY_STAGGER_MS = 30;
const ENTRY_DURATION_MS = 400;
const ENTRY_SETTLE_MS = 50;
const PANEL_WIDTH_PX = 440;
const SELECTED_SCALE_DESKTOP = 4.5;
const SELECTED_SCALE_MOBILE = 1.6;
const SELECTED_SCALE_REDUCED = 1.5;

type FlightTarget = { vbX: number; vbY: number };

type HoverState = { id: string; label: string; x: number; y: number };

// Deterministic 3.5–5.5s ambient period per id (re-render'da değişmesin)
function ambientPeriod(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return 3.5 + (h % 2000) / 1000;
}

type FlatTableProps = {
  table: Table;
  index: number;
  status: TableStatus;
  isDesktop: boolean;
  reducedMotion: boolean;
  flightTarget: FlightTarget | null;
  onSelect: (id: string) => void;
  onHover: (h: HoverState) => void;
  onLeave: () => void;
};

function FlatTable({
  table,
  index,
  status,
  isDesktop,
  reducedMotion,
  flightTarget,
  onSelect,
  onHover,
  onLeave,
}: FlatTableProps) {
  const { id, label, x, y } = table;
  const w = 22;
  const d = 14;
  const ink = status === 'taken' ? 'rgba(31,26,18,.32)' : '#1f1a12';
  const dash = status === 'taken' ? '2 2.5' : '0';
  const fill =
    status === 'recommended'
      ? 'rgba(217,122,60,.18)'
      : status === 'selected'
        ? 'rgba(217,122,60,.32)'
        : 'rgba(255,255,255,.5)';
  const sw = status === 'selected' ? 1.6 : status === 'taken' ? 0.7 : 1;
  const number = id.slice(1);

  const period = useMemo(() => ambientPeriod(id), [id]);
  const [hovered, setHovered] = useState(false);

  // hasEntered: stagger entry tamamlandı mı? Tamamlanınca selection ve
  // ambient transition'larına geçiş açılır. reduced-motion'da anında true.
  const [hasEntered, setHasEntered] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setHasEntered(true);
      return;
    }
    const t = setTimeout(
      () => setHasEntered(true),
      index * ENTRY_STAGGER_MS + ENTRY_DURATION_MS + ENTRY_SETTLE_MS,
    );
    return () => clearTimeout(t);
  }, [index, reducedMotion]);

  const isSelected = status === 'selected';
  const isTaken = status === 'taken';
  // Ambient: entered + idle + reducedMotion off. Selected'da kapalı çünkü
  // ambient inner katmanın 0.015 scale jitter'ı 4.5x büyüme ile çarpışır.
  const ambientOn =
    hasEntered && !isTaken && !isSelected && !reducedMotion;

  // ── Outer motion (selection spring) ─────────────────────
  // Tek motion.g, opacity HİÇ değişmez. Sadece x/y/scale animate edilir.
  // Selection değiştikçe spring back to identity (panel kapanış).
  const outerAnimate = useMemo(() => {
    if (isSelected && reducedMotion) {
      return { x: 0, y: 0, scale: SELECTED_SCALE_REDUCED, opacity: 1 };
    }
    if (isSelected && isDesktop && flightTarget) {
      return {
        x: flightTarget.vbX - x,
        y: flightTarget.vbY - y,
        scale: SELECTED_SCALE_DESKTOP,
        opacity: 1,
      };
    }
    if (isSelected && !isDesktop) {
      return { x: 0, y: 0, scale: SELECTED_SCALE_MOBILE, opacity: 1 };
    }
    return { x: 0, y: 0, scale: 1, opacity: 1 };
  }, [isSelected, isDesktop, reducedMotion, flightTarget, x, y]);

  const outerTransition = useMemo<Transition>(() => {
    if (!hasEntered) {
      return {
        delay: index * (ENTRY_STAGGER_MS / 1000),
        duration: ENTRY_DURATION_MS / 1000,
        ease: [0.2, 0.8, 0.3, 1],
      };
    }
    if (reducedMotion) {
      return { duration: 0 };
    }
    return {
      type: 'spring',
      stiffness: 180,
      damping: 22,
      mass: 0.9,
    };
  }, [hasEntered, reducedMotion, index]);

  // ── Inner motion (ambient breath) ───────────────────────
  // Selection'dan bağımsız, kendi keyframe loop'u. Selected/taken'da kapanır,
  // outer scale ile compose olduğu için 1.015 jitter'ı 4.5x'i bozmaz.
  const innerAnimate = useMemo(() => {
    if (ambientOn) {
      return { scale: [1, 1.015], opacity: [1, 0.97] };
    }
    return { scale: 1, opacity: 1 };
  }, [ambientOn]);

  const innerTransition = useMemo<Transition>(() => {
    if (ambientOn) {
      return {
        duration: period,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse',
      };
    }
    return { duration: 0.25, ease: 'easeOut' };
  }, [ambientOn, period]);

  const outerInitial = reducedMotion
    ? { x: 0, y: 0, scale: 1, opacity: 1 }
    : { x: 0, y: 0, scale: 0.5, opacity: 0 };

  const className = `${styles.tbl}${isTaken ? ` ${styles.taken}` : ''}`;

  // Hover lift — selection sırasında kapalı (4.5x büyüme zaten dikkat çekiyor,
  // ek lift karışıklık yaratır).
  const whileHover =
    !isTaken && !isSelected && !reducedMotion ? { y: -4 } : undefined;

  // Shadow hover'da derinleşir.
  const shadowRy = hovered && !isTaken && !isSelected ? 4 : 3;
  const shadowOpacity =
    hovered && !isTaken && !isSelected
      ? 0.28
      : isTaken
        ? 0.1
        : 0.18;
  const shadowCy =
    hovered && !isTaken && !isSelected ? y + d / 2 + 5 : y + d / 2 + 4;

  // Origin: fill-box + center → motion.g'nin kendi bbox merkezi. Framer'ın
  // default'uyla uyumlu, override sorunu yok. Bbox'ın simetrik kalması için
  // "bizden öneri" text'i motion.g'nin DIŞINA (Fragment sibling olarak)
  // çıkarılıyor, böylece scale tam tablo merkezinden büyür.

  return (
    <>
    <motion.g
      style={{
        color: ink,
        transformBox: 'fill-box',
        transformOrigin: 'center',
      }}
      className={className}
      initial={outerInitial}
      animate={outerAnimate}
      transition={outerTransition}
      onClick={isTaken ? undefined : () => onSelect(id)}
      onMouseEnter={() => {
        setHovered(true);
        onHover({ id, label, x, y });
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
      whileHover={whileHover}
      role={isTaken ? 'img' : 'button'}
      tabIndex={isTaken ? -1 : 0}
      aria-label={
        isTaken
          ? `${label} (dolu)`
          : `${label} — boş, seçmek için tıklayın`
      }
      onKeyDown={(e) => {
        if (isTaken) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <motion.g
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
        animate={innerAnimate}
        transition={innerTransition}
      >
      <ellipse
        cx={x}
        cy={shadowCy}
        rx={12}
        ry={shadowRy}
        fill="#1f1a12"
        opacity={shadowOpacity}
      />
      <line
        x1={x - w / 2 - 5}
        y1={y}
        x2={x - w / 2 - 1}
        y2={y}
        stroke={ink}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1={x + w / 2 + 1}
        y1={y}
        x2={x + w / 2 + 5}
        y2={y}
        stroke={ink}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1={x}
        y1={y - d / 2 - 4}
        x2={x}
        y2={y - d / 2 - 1}
        stroke={ink}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1={x}
        y1={y + d / 2 + 1}
        x2={x}
        y2={y + d / 2 + 4}
        stroke={ink}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <rect
        x={x - w / 2}
        y={y - d / 2}
        width={w}
        height={d}
        fill={fill}
        stroke={ink}
        strokeWidth={sw}
        strokeDasharray={dash}
      />
      {!isTaken && (
        <line
          x1={x - w / 2 + 3}
          y1={y - d / 2 + 3}
          x2={x + w / 2 - 3}
          y2={y - d / 2 + 3}
          stroke={ink}
          strokeWidth="0.4"
          opacity={0.4}
        />
      )}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-spectral), Spectral, Georgia, serif"
        fontStyle="italic"
        fontSize={9}
        fill="currentColor"
        opacity={isTaken ? 0.4 : 0.7}
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        {number}
      </text>
      {status === 'recommended' && (
        <circle
          cx={x}
          cy={y}
          r={22}
          stroke="#d97a3c"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          fill="none"
          opacity={0.7}
        />
      )}
      </motion.g>
    </motion.g>
    {/* "bizden öneri" motion.g'nin DIŞINDA: bbox'ı asimetrikleştirmesin
        → fill-box origin tablo merkezinde kalsın. Tablo seçilip uçtuğunda
        text yerinde kalır, "bu masa öneriydi" işareti olarak orada durur. */}
    {status === 'recommended' && (
      <text
        x={x + 16}
        y={y - 14}
        fontFamily="var(--font-spectral), Spectral, Georgia, serif"
        fontStyle="italic"
        fontSize={9}
        fill="#d97a3c"
        opacity={1}
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        bizden öneri
      </text>
    )}
    </>
  );
}

function SeaBackdrop() {
  // Hand-drawn choppy waves — port from handoff.
  const wave = (y: number, amp = 5, phase = 0, choppy = false) => {
    const start = -380;
    const end = 380;
    let d = `M${start} ${y}`;
    let x = start;
    let i = 0;
    while (x < end) {
      const seed = (i * 13 + phase) % 100;
      const seed2 = (i * 7 + phase * 3) % 100;
      const step = choppy ? 14 + (seed % 18) : 26 + (seed % 14);
      const peakH = choppy ? amp + (seed2 % 8) - 2 : amp;
      const dir = i % 2 === 0 ? -1 : 1;
      const xMid = x + step / 2;
      const yPeak = y + dir * peakH * (choppy ? 1 : 0.8);
      if (choppy) {
        d += ` L${xMid} ${yPeak} L${x + step} ${y + ((seed % 3) - 1)}`;
      } else {
        d += ` Q${xMid} ${yPeak} ${x + step} ${y + ((seed % 3) - 1) * 0.5}`;
      }
      x += step;
      i++;
    }
    return d;
  };

  return (
    <g opacity={0.75}>
      <g className={styles.ambientSun}>
        <circle
          cx={-310}
          cy={-180}
          r={34}
          stroke="#1f1a12"
          strokeWidth="1"
          strokeDasharray="2 3"
          fill="rgba(217,122,60,.18)"
        />
        <circle
          cx={-310}
          cy={-180}
          r={20}
          fill="#d97a3c"
          fillOpacity={0.15}
        />
      </g>

      <g
        className={styles.ambientSea}
        stroke="#1f1a12"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={wave(-180, 4, 3, false)} strokeWidth="0.6" opacity={0.5} />
        <path d={wave(-168, 5, 18, false)} strokeWidth="0.6" opacity={0.55} />
        <path d={wave(-157, 7, 41, true)} strokeWidth="0.9" opacity={0.7} />
        <path d={wave(-147, 9, 17, true)} strokeWidth="1" opacity={0.8} />
        <path d={wave(-135, 11, 63, true)} strokeWidth="1.1" opacity={0.85} />
        <path d={wave(-124, 8, 29, true)} strokeWidth="0.9" opacity={0.7} />
        <path d={wave(-112, 6, 51, true)} strokeWidth="0.8" opacity={0.6} />
        <path d={wave(-100, 4, 8, false)} strokeWidth="0.6" opacity={0.5} />
        <path d={wave(-90, 3, 14, false)} strokeWidth="0.5" opacity={0.4} />
      </g>

      <g
        stroke="#d97a3c"
        strokeWidth="1.2"
        fill="none"
        opacity={0.55}
        strokeLinecap="round"
      >
        <path d="M-280 -178 l14 0" />
        <path d="M-258 -167 l18 -2" />
        <path d="M-236 -154 l20 -3" />
        <path d="M-214 -142 l24 -4" />
        <path d="M-194 -129 l26 -5" />
        <path d="M-174 -117 l28 -6" />
      </g>

      <path
        d="M-380 -112 Q-200 -122 -40 -114 T200 -108 T380 -102"
        stroke="#1f1a12"
        strokeWidth="0.8"
        opacity={0.55}
        fill="none"
      />
      <path
        d="M-380 -106 Q-200 -116 -40 -108 T200 -102 T380 -96"
        stroke="#1f1a12"
        strokeWidth="0.4"
        opacity={0.3}
        fill="none"
      />

      <rect
        x={-380}
        y={-106}
        width={760}
        height={22}
        fill="#ead9b8"
        fillOpacity={0.6}
      />
      <rect
        x={-380}
        y={-106}
        width={760}
        height={22}
        fill="#d97a3c"
        fillOpacity={0.06}
      />
      <g fill="#1f1a12" opacity={0.28}>
        {Array.from({ length: 70 }, (_, i) => {
          const sx = -370 + i * 10.8 + ((i * 31) % 7);
          const sy = -102 + ((i * 17) % 18);
          return <circle key={i} cx={sx} cy={sy} r={0.7} />;
        })}
      </g>
      <g fill="#1f1a12" opacity={0.22}>
        <ellipse
          cx={-180}
          cy={-98}
          rx={2.5}
          ry={1.2}
          transform="rotate(20 -180 -98)"
        />
        <ellipse
          cx={-172}
          cy={-90}
          rx={2.5}
          ry={1.2}
          transform="rotate(20 -172 -90)"
        />
        <ellipse
          cx={-164}
          cy={-98}
          rx={2.5}
          ry={1.2}
          transform="rotate(20 -164 -98)"
        />
        <ellipse
          cx={80}
          cy={-92}
          rx={2.5}
          ry={1.2}
          transform="rotate(-15 80 -92)"
        />
        <ellipse
          cx={88}
          cy={-100}
          rx={2.5}
          ry={1.2}
          transform="rotate(-15 88 -100)"
        />
      </g>
      <text
        x={220}
        y={-90}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={11}
        fill="#1f1a12"
        opacity={0.45}
      >
        kum
      </text>

      <rect x={-380} y={-85} width={760} height={13} fill="#f3ead8" />
      <line
        x1={-380}
        y1={-85}
        x2={380}
        y2={-85}
        stroke="#1f1a12"
        strokeWidth="0.7"
        opacity={0.5}
      />
      <line
        x1={-380}
        y1={-72}
        x2={380}
        y2={-72}
        stroke="#1f1a12"
        strokeWidth="0.7"
        opacity={0.5}
      />
      <g stroke="#1f1a12" strokeWidth="0.5" opacity={0.38}>
        {Array.from({ length: 22 }, (_, i) => {
          const lx = -360 + i * 35;
          return <line key={i} x1={lx} y1={-85} x2={lx} y2={-72} />;
        })}
      </g>
      <g
        stroke="#1f1a12"
        strokeWidth="0.8"
        fill="none"
        opacity={0.7}
        strokeLinecap="round"
      >
        <g transform="translate(-90 -78)">
          <circle cx={0} cy={-6} r={1.4} fill="#1f1a12" />
          <line x1={0} y1={-4} x2={0} y2={3} />
          <line x1={0} y1={-2} x2={-3} y2={1} />
          <line x1={0} y1={-2} x2={3} y2={1} />
          <line x1={0} y1={3} x2={-2} y2={7} />
          <line x1={0} y1={3} x2={2} y2={7} />
        </g>
        <g transform="translate(-82 -78)">
          <circle cx={0} cy={-6} r={1.2} fill="#1f1a12" />
          <line x1={0} y1={-4} x2={0} y2={2} />
          <line x1={0} y1={-2} x2={3} y2={0} />
          <line x1={0} y1={2} x2={-2} y2={6} />
          <line x1={0} y1={2} x2={2} y2={6} />
        </g>
        <g transform="translate(160 -78)">
          <circle cx={0} cy={-6} r={1.4} fill="#1f1a12" />
          <line x1={0} y1={-4} x2={0} y2={3} />
          <line x1={0} y1={-2} x2={-3} y2={1} />
          <line x1={0} y1={-2} x2={3} y2={1} />
          <line x1={0} y1={3} x2={-2} y2={7} />
          <line x1={0} y1={3} x2={3} y2={6} />
        </g>
      </g>
      <text
        x={-360}
        y={-76}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={10}
        fill="#1f1a12"
        opacity={0.45}
      >
        — sahil yolu —
      </text>

      <g stroke="#1f1a12" strokeWidth="0.7" fill="none" opacity={0.55}>
        <line x1={-340} y1={-68} x2={340} y2={-68} />
        <line x1={-340} y1={-64} x2={340} y2={-64} />
        {Array.from({ length: 18 }, (_, i) => {
          const fx = -340 + i * 40;
          return <line key={i} x1={fx} y1={-70} x2={fx} y2={-61} />;
        })}
      </g>
      <rect x={-12} y={-71} width={24} height={11} fill="#f3ead8" />
      <text
        x={-22}
        y={-61}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={9}
        fill="#1f1a12"
        opacity={0.55}
      >
        ↓ giriş
      </text>

      <rect
        x={-380}
        y={35}
        width={760}
        height={60}
        fill="#ead9b8"
        fillOpacity={0.35}
      />
      <line
        x1={-380}
        y1={35}
        x2={380}
        y2={35}
        stroke="#1f1a12"
        strokeWidth="0.5"
        strokeDasharray="3 4"
        opacity={0.5}
      />
      <text
        x={-360}
        y={46}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={10}
        fill="#1f1a12"
        opacity={0.5}
      >
        iç salon
      </text>

      <g transform="translate(0 100)">
        <rect
          x={-150}
          y={-9}
          width={300}
          height={18}
          fill="#f3ead8"
          stroke="#1f1a12"
          strokeWidth="0.8"
          opacity={0.9}
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
          fontFamily="var(--font-spectral), serif"
          fontSize={13}
          fill="#1f1a12"
          letterSpacing="0.08em"
        >
          ÇALIŞ BALIKÇISI
        </text>
        <path
          d="M-168 0 q3 -3 7 0 q4 3 7 0 l-3 0 l3 3 l-3 0 q-4 -3 -7 0 q-4 3 -7 0 z"
          stroke="#1f1a12"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M168 0 q-3 -3 -7 0 q-4 3 -7 0 l3 0 l-3 3 l3 0 q4 -3 7 0 q4 3 7 0 z"
          stroke="#1f1a12"
          strokeWidth="0.5"
          fill="none"
        />
      </g>

      <rect
        x={-380}
        y={112}
        width={760}
        height={64}
        fill="#1f1a12"
        fillOpacity={0.06}
      />
      <line
        x1={-380}
        y1={124}
        x2={380}
        y2={124}
        stroke="#1f1a12"
        strokeWidth="0.6"
        strokeDasharray="3 3"
        opacity={0.5}
      />
      <g stroke="#1f1a12" strokeWidth="0.7" fill="none" opacity={0.5}>
        {[-260, -90, 90, 260].map((sx, i) => (
          <g key={i}>
            <path d={`M${sx - 30} 120 L${sx - 24} 114 L${sx + 24} 114 L${sx + 30} 120`} />
            <path d={`M${sx - 6} 114 q-2 -4 0 -8 q2 -4 0 -8`} opacity={0.4} />
            <path d={`M${sx + 6} 114 q-2 -4 0 -8 q2 -4 0 -8`} opacity={0.4} />
          </g>
        ))}
      </g>
      <g fill="#d97a3c" fillOpacity={0.55} stroke="#1f1a12" strokeWidth="0.5">
        {[-260, -90, 90, 260].map((sx, i) => (
          <g key={i}>
            <path
              d={`M${sx - 16} 134 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 l0 4 l-30 0 z`}
            />
          </g>
        ))}
      </g>
      <g opacity={0.88}>
        {[
          { x: -260, facing: 1 },
          { x: -90, facing: 1 },
          { x: 90, facing: -1 },
          { x: 260, facing: -1 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.x} 156)`}>
            <path
              d="M-13 0 L-10 -22 L10 -22 L13 0 Z"
              fill="#f3ead8"
              stroke="#1f1a12"
              strokeWidth="0.7"
            />
            <line x1={-6} y1={-22} x2={-6} y2={-2} stroke="#1f1a12" strokeWidth="0.4" opacity={0.6} />
            <line x1={6} y1={-22} x2={6} y2={-2} stroke="#1f1a12" strokeWidth="0.4" opacity={0.6} />
            <line x1={-2} y1={-22} x2={-2} y2={-26} stroke="#1f1a12" strokeWidth="1.2" />
            <line x1={2} y1={-22} x2={2} y2={-26} stroke="#1f1a12" strokeWidth="1.2" />
            <circle cx={0} cy={-31} r={4.2} fill="#e8d4b0" stroke="#1f1a12" strokeWidth="0.7" />
            <line x1={-2} y1={-31} x2={-1} y2={-30} stroke="#1f1a12" strokeWidth="0.5" />
            <path
              d="M-5 -35 q-3 -2 -3 -6 q0 -5 4 -5 q1 -3 4 -3 q3 0 4 3 q4 0 4 5 q0 4 -3 6 z"
              fill="#f3ead8"
              stroke="#1f1a12"
              strokeWidth="0.7"
            />
            <line x1={-5} y1={-35} x2={5} y2={-35} stroke="#1f1a12" strokeWidth="0.5" />
            <path
              d={`M${c.facing * 10} -20 Q${c.facing * 16} -14 ${c.facing * 18} -8`}
              stroke="#1f1a12"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M${c.facing * 18} -8 Q${c.facing * 22} -4 ${c.facing * 24} 2`}
              stroke="#1f1a12"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            <circle
              cx={c.facing * 24}
              cy={2}
              r={1.4}
              fill="#e8d4b0"
              stroke="#1f1a12"
              strokeWidth="0.5"
            />
            <line
              x1={c.facing * 24}
              y1={2}
              x2={c.facing * 32}
              y2={-2}
              stroke="#1f1a12"
              strokeWidth="1"
            />
            <rect
              x={c.facing > 0 ? 31 : -34}
              y={-4}
              width={3}
              height={3}
              stroke="#1f1a12"
              strokeWidth="0.5"
              fill="none"
            />
          </g>
        ))}
      </g>
      <g stroke="#1f1a12" strokeWidth="0.6" fill="none" opacity={0.55}>
        {[-260, -90, 90, 260].map((sx, i) => (
          <g key={i} transform={`translate(${sx} 130)`}>
            <path d="M-7 0 q3 -3 7 0 q4 3 7 0 l-3 0 l3 3 l-3 0 q-4 -3 -7 0 q-4 3 -7 0 z" />
          </g>
        ))}
      </g>
      <text
        x={-360}
        y={168}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={11}
        fill="#1f1a12"
        opacity={0.55}
      >
        mutfak — ızgara
      </text>

      <text
        x={-360}
        y={-180}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={13}
        fill="#1f1a12"
        opacity={0.55}
      >
        Çalış sahili
      </text>

      <g
        transform="translate(120 -136)"
        stroke="#1f1a12"
        strokeWidth="0.8"
        fill="none"
        opacity={0.55}
      >
        <path d="M-10 0 q10 4 20 0 l-2 -4 l-16 0 z" />
        <line x1={0} y1={0} x2={0} y2={-14} />
        <path d="M0 -14 l8 12 l-8 0 z" />
      </g>
      <g
        transform="translate(280 -109)"
        stroke="#1f1a12"
        strokeWidth="0.6"
        fill="none"
        opacity={0.4}
      >
        <path d="M-7 0 q7 3 14 0 l-1.5 -3 l-11 0 z" />
        <line x1={0} y1={0} x2={0} y2={-10} />
        <path d="M0 -10 l5 8 l-5 0 z" />
      </g>

      <g stroke="#1f1a12" strokeWidth="0.5" fill="none" opacity={0.5}>
        <path d="M-60 -185 q3 -3 6 0 q3 -3 6 0" />
        <path d="M-30 -175 q2 -2 4 0 q2 -2 4 0" />
        <path d="M40 -188 q3 -3 6 0 q3 -3 6 0" />
      </g>
    </g>
  );
}

type Props = {
  selectedId: string | null;
  flightId: string | null;
  isDesktop: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
};

function statusFor(
  id: string,
  flightId: string | null,
): TableStatus {
  if (TAKEN_IDS.has(id)) return 'taken';
  if (flightId === id) return 'selected';
  if (RECOMMENDED_IDS.has(id)) return 'recommended';
  return 'free';
}

export function IsoMap({
  selectedId,
  flightId,
  isDesktop,
  reducedMotion,
  onSelect,
}: Props) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [flightTarget, setFlightTarget] = useState<FlightTarget | null>(null);

  // SVG container'ın ekran bbox'unu ölç → panel solundaki alanın merkezini
  // viewBox koordinatına çevir. Resize'da ResizeObserver ile günceller.
  useEffect(() => {
    if (!isDesktop) {
      setFlightTarget(null);
      return;
    }
    const el = svgRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;

      // preserveAspectRatio="xMidYMid meet": içerik ya yüksekliği ya da
      // genişliği doldurur, diğer eksende letterbox bırakır.
      const contentAspect = VB_W / VB_H; // 2.0
      const containerAspect = r.width / r.height;
      let scale: number, offsetX: number, offsetY: number;
      if (containerAspect > contentAspect) {
        // Container daha geniş → yükseklik fills, yatay letterbox
        scale = r.height / VB_H;
        offsetX = (r.width - VB_W * scale) / 2;
        offsetY = 0;
      } else {
        scale = r.width / VB_W;
        offsetX = 0;
        offsetY = (r.height - VB_H * scale) / 2;
      }

      // Panel solundaki alanın yatay ortası (ekran px) — panel sağda 440px
      const targetScreenX = (window.innerWidth - PANEL_WIDTH_PX) / 2;
      const targetScreenY = window.innerHeight / 2;

      const cx = targetScreenX - r.left;
      const cy = targetScreenY - r.top;

      // ViewBox koordinatına çevir
      const vbX = VB_X_MIN + (cx - offsetX) / scale;
      const vbY = VB_Y_MIN + (cy - offsetY) / scale;

      setFlightTarget({ vbX, vbY });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isDesktop]);

  // Tüm masalar tek listede + her id'nin ORİJİNAL stagger index'i ayrı.
  const allTables = useMemo<Table[]>(
    () => [...SEA_TABLES, ...INDOOR_TABLES],
    [],
  );
  const indexMap = useMemo(
    () => new Map(allTables.map((t, i) => [t.id, i])),
    [allTables],
  );

  // selected (panel açık veya spring-back grace'inde) en sona render edilir
  // → SVG document order'da en üstte, diğer masaların altına gömülmez.
  const orderedTables = useMemo<Table[]>(() => {
    if (!selectedId) return allTables;
    const sel = allTables.find((t) => t.id === selectedId);
    if (!sel) return allTables;
    return [...allTables.filter((t) => t.id !== selectedId), sel];
  }, [allTables, selectedId]);

  return (
    <div className={styles.isoCanvas}>
      <svg
        ref={svgRef}
        className={styles.iso}
        viewBox={`-${VB_W / 2} -${VB_H / 2} ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Çalış Balıkçısı kuşbakışı mekân haritası"
      >
        <defs>
          <linearGradient id="rez-groundwash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3ead8" stopOpacity="0" />
            <stop offset="100%" stopColor="#ead9b8" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect
          x={-VB_W / 2}
          y={-VB_H / 2}
          width={VB_W}
          height={VB_H}
          fill="url(#rez-groundwash)"
        />

        <SeaBackdrop />

        <g>
          {orderedTables.map((t) => (
            <FlatTable
              key={t.id}
              table={t}
              index={indexMap.get(t.id) ?? 0}
              status={statusFor(t.id, flightId)}
              isDesktop={isDesktop}
              reducedMotion={reducedMotion}
              flightTarget={flightTarget}
              onSelect={onSelect}
              onHover={setHover}
              onLeave={() => setHover(null)}
            />
          ))}
        </g>

        <text
          x={VB_W / 2 - 16}
          y={VB_H / 2 - 14}
          textAnchor="end"
          fontFamily="var(--font-spectral), serif"
          fontStyle="italic"
          fontSize={11}
          fill="#1f1a12"
          opacity={0.4}
        >
          — ışık 18:42 civarı
        </text>
      </svg>

      {hover && (
        <div
          className={`${styles.tableTip} ${styles.show}`}
          style={{
            left: `calc(50% + ${hover.x * (100 / VB_W)}%)`,
            top: `calc(50% + ${hover.y * (100 / VB_H)}%)`,
          }}
        >
          {hover.label}
        </div>
      )}
    </div>
  );
}
