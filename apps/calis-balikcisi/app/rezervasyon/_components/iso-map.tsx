'use client';

import { motion, type Transition } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { INDOOR_TABLES, SEA_TABLES } from '../_data/tables';
import { TAKEN_IDS } from '../_data/mock-reservations';
import {
  SUN_BASE_CX,
  type AtmosphereTokens,
  type TimeKey,
} from '../_lib/atmosphere';
import type { Table, TableStatus } from '../_types/reservation';
import styles from '../_styles/reservation.module.css';

const VB_W = 760;
const VB_H = 380;
const VB_X_MIN = -VB_W / 2; // -380
const VB_Y_MIN = -VB_H / 2; // -190

// Sky'da yer alan deterministik 6 martı slot. tokens.seagullCount ilk N
// tanesinin opacity'sini açar; geri kalan slot'lar opacity 0 ile durur
// (smooth fade, AnimatePresence yerine). Desktop sky y range -190..-170
// (üst kenar), mobile sky y range -340..-300 (deniz daha aşağı).
const DESKTOP_SEAGULL_POSITIONS = [
  { x: -150, y: -180 },
  { x: -60, y: -185 },
  { x: -30, y: -175 },
  { x: 40, y: -188 },
  { x: 110, y: -178 },
  { x: 200, y: -185 },
];

const MOBILE_SEAGULL_POSITIONS = [
  { x: -50, y: -320 },
  { x: 20, y: -300 },
  { x: 80, y: -340 },
  { x: -130, y: -315 },
  { x: 110, y: -325 },
  { x: 150, y: -310 },
];

// Mobile tekne x/y lookup — desktop tokens.boatX/Y mobil viewBox'a
// (-200..+200, sky y=-350..-260) düşmediği için saat-bazlı ayrı tablo.
// Erken saatlerde tekne sol-orta sky'da (~-280), geç saatte sağa kayar
// + ufuk yakını (-308'e doğru) + opacity sıfırlanır (ortak token).
const MOBILE_BOAT_X: Record<TimeKey, number> = {
  '17:30': 70,
  '18:00': 90,
  '18:30': 120,
  '19:00': 145,
  '19:30': 165,
  '20:00': 185,
  '20:30': 200,
  '21:00': 215,
  '21:30': 220,
  '22:00': 225,
  '22:30': 230,
};

const MOBILE_BOAT_Y: Record<TimeKey, number> = {
  '17:30': -270,
  '18:00': -278,
  '18:30': -286,
  '19:00': -293,
  '19:30': -298,
  '20:00': -302,
  '20:30': -305,
  '21:00': -307,
  '21:30': -308,
  '22:00': -308,
  '22:30': -308,
};

// Mobile portre viewBox — sahne dikey kompoz, sky üstte / masalar+mutfak altta.
// NORMAL: header görünür iken (panel kapalı). h=720 → bottom y=370 → mutfak
// rect (y=240..340), şefler (y=290..320), "mutfak — ızgara" etiketi (y=335)
// hepsi viewBox içinde tam görünür.
// EXPANDED: panel açık + header gizli iken — y daha yukarı (sky alanı 110
// birim genişler, sun/moon nefes alır), h orantılı büyür. Bottom y=370
// sabit → masalar+mutfak değişmez, üstte ekstra sky.
const VB_MOBILE_NORMAL = { x: -200, y: -350, w: 400, h: 720 };
const VB_MOBILE_EXPANDED = { x: -200, y: -460, w: 400, h: 830 };
const ENTRY_STAGGER_MS = 30;
const ENTRY_DURATION_MS = 400;
const ENTRY_SETTLE_MS = 50;
const PANEL_WIDTH_PX = 440;
const SELECTED_SCALE_DESKTOP = 4.5;
const SELECTED_SCALE_MOBILE = 1.6;
const SELECTED_SCALE_REDUCED = 1.5;

type FlightTarget = { vbX: number; vbY: number };

type HoverState = { id: string; label: string; x: number; y: number };

// Mobile için tablo pozisyonu — masalar aşağı doğru genişlemiş, sıralar
// arası nefes daha çok. viewBox 400×600 alt kısmına yayılır.
function getMobileTablePosition(table: Table): { x: number; y: number } {
  if (table.zone === 'sea') {
    const idx = parseInt(table.id.slice(1), 10) - 1; // D1 → 0, D30 → 29
    const row = Math.floor(idx / 10);
    const col = idx % 10;
    // 3 sıra: y = -40, +5, +50 (sıra arası 45 birim).
    return { x: -180 + col * 40, y: -40 + row * 45 };
  }
  // indoor — zone y=95..220. row 0 y=130, row 1 y=185 (sıra arası 55).
  const idx = parseInt(table.id.slice(1), 10) - 1; // S1 → 0, S18 → 17
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  return { x: -160 + col * 40, y: 130 + row * 55 };
}

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
  isMobile: boolean;
  reducedMotion: boolean;
  flightTarget: FlightTarget | null;
  /** Pozisyon — mobile/desktop'a göre çağıran hesaplar. */
  tableX: number;
  tableY: number;
  onSelect: (id: string) => void;
  onHover: (h: HoverState) => void;
  onLeave: () => void;
};

function FlatTable({
  table,
  index,
  status,
  isDesktop,
  isMobile,
  reducedMotion,
  flightTarget,
  tableX,
  tableY,
  onSelect,
  onHover,
  onLeave,
}: FlatTableProps) {
  const { id, label } = table;
  const x = tableX;
  const y = tableY;
  // Mobile'da daha büyük tıklanabilir alan: 34×22 viewBox birim → ~33×22px
  // (mobile viewBox 400×600, container ~390×~674, scale ≈ 0.97).
  const w = isMobile ? 34 : 22;
  const d = isMobile ? 22 : 14;
  // Ink: currentColor sayesinde --rez-ink mirası alır → faz değişiminde
  // smooth interpolate. Taken için ayrıca opacity uygulanır (aşağıda).
  const ink = 'currentColor';
  const dash = status === 'taken' ? '2 2.5' : '0';
  const fill =
    status === 'selected'
      ? 'rgba(217,122,60,.32)'
      : 'var(--rez-table-fill)';
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
  // outer scale ile compose olduğu için scale jitter outer büyümeyi bozmaz.
  // Genlik biraz büyütüldü (1.025/0.92) — küçük masalarda fark edilirlik için.
  const innerAnimate = useMemo(() => {
    if (ambientOn) {
      return { scale: [1, 1.025], opacity: [1, 0.92] };
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

  // Inner'ın initial'ı stable kalsın — hasEntered false→true geçişinde
  // Framer Motion keyframe loop'u restart ederken initial referansı bozmasın.
  const innerInitial = useMemo(() => ({ scale: 1, opacity: 1 }), []);

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
        color: 'var(--rez-ink)',
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
        initial={innerInitial}
        animate={innerAnimate}
        transition={innerTransition}
      >
      <ellipse
        cx={x}
        cy={shadowCy}
        rx={12}
        ry={shadowRy}
        fill="currentColor"
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
        fontSize={isMobile ? 12 : 9}
        fill="currentColor"
        opacity={isTaken ? 0.4 : 0.7}
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        {number}
      </text>
      </motion.g>
    </motion.g>
    </>
  );
}

type SeaBackdropProps = {
  tokens: AtmosphereTokens;
  reducedMotion: boolean;
  isMobile: boolean;
  timeKey: TimeKey;
};

// Dispatcher — desktop ya da mobile sahne render eder. Mobile portre kompoz
// ayrı bir component; element pozisyonları viewBox 400×700'e göre düzenlenmiş.
function SeaBackdrop({
  tokens,
  reducedMotion,
  isMobile,
  timeKey,
}: SeaBackdropProps) {
  if (isMobile) {
    return (
      <MobileSeaBackdrop
        tokens={tokens}
        reducedMotion={reducedMotion}
        timeKey={timeKey}
      />
    );
  }
  return (
    <DesktopSeaBackdrop tokens={tokens} reducedMotion={reducedMotion} />
  );
}

type SubBackdropProps = {
  tokens: AtmosphereTokens;
  reducedMotion: boolean;
};

type MobileBackdropProps = SubBackdropProps & {
  timeKey: TimeKey;
};

function DesktopSeaBackdrop({ tokens, reducedMotion }: SubBackdropProps) {
  // isMobile burada always false — mevcut `!isMobile && ...` koşulları aşağıda
  // değişmeden kaldı. Mobile branch render edilmez.
  const isMobile = false;
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
    // currentColor: tüm child'lar `stroke="currentColor"` / `fill="currentColor"`
    // ile bu rengi kullanır → faz değişiminde @property registration ile
    // smooth interpolate olur. Wave stroke ayrı (kendi tokeni var).
    <g opacity={0.75} style={{ color: 'var(--rez-ink)' }}>
      {/* Güneş — sunCy/sunOpacity token'a bağlı, sunCx (default -310).
          17:30 cy=-170 (yüksek) → 19:00 cy=-130 (yarı batık) → 20:00 cy=-100
          opacity 0.3 (neredeyse battı) → 20:30+ opacity 0 (kayboldu). */}
      <motion.g
        animate={{ y: tokens.sunCy, opacity: tokens.sunOpacity }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ x: tokens.sunCx }}
      >
        <g className={styles.ambientSun}>
          <circle
            cx={0}
            cy={0}
            r={34}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            fill="rgba(217,122,60,.18)"
          />
          <circle
            cx={0}
            cy={0}
            r={20}
            fill="#d97a3c"
            fillOpacity={0.15}
          />
        </g>
      </motion.g>

      {/* Ay — moonCx default -80 (sahnenin sol-orta, panel açıkken görünür).
          19:30'da denizden doğmaya başlar (cy=-90, op 0.2, phase 0.3 yarım
          ay). 22:00+'da tam ay (op 1, phase 1, cy=-185). Yarım/gibbous için
          OVERLAP yöntemi: krem ana disk üstüne sky-top fill'li gölge daire
          offset'le çizilir, hilal illüzyonu verir. (Mask karmaşık + ID
          rerender riskli — overlap daha güvenli.) */}
      {tokens.moonOpacity > 0 && (
        <motion.g
          animate={{
            x: tokens.moonCx,
            y: tokens.moonCy,
            opacity: tokens.moonOpacity,
          }}
          transition={{
            duration: reducedMotion ? 0 : 1,
            ease: [0.4, 0, 0.2, 1],
          }}
          aria-hidden="true"
        >
          {/* Ana ay diski — krem fill, dashed currentColor border */}
          <circle
            cx={0}
            cy={0}
            r={32}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            fill="rgba(245,235,210,0.85)"
            opacity={0.9}
          />
          {/* Faz gölgesi: sky-top fill'le ay'ın bir kısmını "yutar".
              moonPhase=1.0'da gölge daire ay'ın dışına kayar (görünmez).
              moonPhase=0.3'te gölge ay'ın çoğunu kapsar (hilal). */}
          {tokens.moonPhase < 1 && (
            <circle
              cx={(1 - tokens.moonPhase) * 30}
              cy={(1 - tokens.moonPhase) * 20}
              r={32 - tokens.moonPhase * 6}
              fill="var(--rez-sky-top)"
            />
          )}
          {/* Kraterler — sadece moonPhase > 0.7 (gibbous+ ve tam) */}
          {tokens.moonPhase > 0.7 && (
            <>
              <circle
                cx={-8}
                cy={-5}
                r={3}
                fill="currentColor"
                opacity={0.25}
              />
              <circle
                cx={10}
                cy={8}
                r={2}
                fill="currentColor"
                opacity={0.2}
              />
            </>
          )}
        </motion.g>
      )}

      <g
        className={styles.ambientSea}
        stroke="var(--rez-wave-stroke)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={wave(-180, 2, 3, false)} strokeWidth="0.5" opacity={0.4} />
        <path d={wave(-168, 2, 18, false)} strokeWidth="0.5" opacity={0.45} />
        <path d={wave(-157, 3, 41, false)} strokeWidth="0.6" opacity={0.5} />
        <path d={wave(-147, 3, 17, false)} strokeWidth="0.7" opacity={0.55} />
        <path d={wave(-135, 3, 63, false)} strokeWidth="0.8" opacity={0.65} />
        <path d={wave(-124, 3, 29, false)} strokeWidth="0.6" opacity={0.5} />
        <path d={wave(-112, 2, 51, false)} strokeWidth="0.55" opacity={0.45} />
        <path d={wave(-100, 2, 8, false)} strokeWidth="0.5" opacity={0.4} />
        <path d={wave(-90, 2, 14, false)} strokeWidth="0.4" opacity={0.35} />
      </g>

      {/* Sun glitter — copper yansımalar. Saat ilerledikçe (güneş battıkça)
          opacity azalır, 20:30+'da 0. Pozisyonu güneşle birlikte sağa kayar:
          path'ler SUN_BASE_CX (-310) referans alarak yazılmış, motion.g
          x offset'i = tokens.sunCx - SUN_BASE_CX (17:30=0, 20:00=180). */}
      <motion.g
        stroke="#d97a3c"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: tokens.sunGlitterOpacity,
          x: tokens.sunCx - SUN_BASE_CX,
        }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <path d="M-272 -126 l10 0" />
        <path d="M-252 -122 l14 -1" />
        <path d="M-228 -118 l18 -2" />
        <path d="M-200 -114 l22 -2" />
      </motion.g>

      {/* Moon glitter — krem ay yansıması ufuk seviyesinde, ay'ın altında.
          Ay cx=-80 etrafında, y=-104 ile -110 arası 3 kısa beyaz çizgi.
          19:30'da hafif belirir, 22:30'da en parlak. */}
      <motion.g
        stroke="rgba(245,235,210,0.9)"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
        animate={{ opacity: tokens.moonGlitterOpacity }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <path d="M-95 -106 l8 0" />
        <path d="M-86 -110 l12 -1" />
        <path d="M-72 -104 l10 0" />
      </motion.g>

      <path
        d="M-380 -112 Q-200 -122 -40 -114 T200 -108 T380 -102"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity={0.55}
        fill="none"
      />
      <path
        d="M-380 -106 Q-200 -116 -40 -108 T200 -102 T380 -96"
        stroke="currentColor"
        strokeWidth="0.4"
        opacity={0.3}
        fill="none"
      />

      <rect
        x={-380}
        y={-106}
        width={760}
        height={22}
        fill="var(--rez-sand)"
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
      <g fill="currentColor" opacity={0.28}>
        {Array.from({ length: 70 }, (_, i) => {
          const sx = -370 + i * 10.8 + ((i * 31) % 7);
          const sy = -102 + ((i * 17) % 18);
          return <circle key={i} cx={sx} cy={sy} r={0.7} />;
        })}
      </g>
      <g fill="currentColor" opacity={0.22}>
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
        fill="currentColor"
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
        stroke="currentColor"
        strokeWidth="0.7"
        opacity={0.5}
      />
      <line
        x1={-380}
        y1={-72}
        x2={380}
        y2={-72}
        stroke="currentColor"
        strokeWidth="0.7"
        opacity={0.5}
      />
      <g stroke="currentColor" strokeWidth="0.5" opacity={0.38}>
        {Array.from({ length: 22 }, (_, i) => {
          const lx = -360 + i * 35;
          return <line key={i} x1={lx} y1={-85} x2={lx} y2={-72} />;
        })}
      </g>
      <g
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity={0.7}
        strokeLinecap="round"
      >
        <g transform="translate(-90 -78)">
          <circle cx={0} cy={-6} r={1.4} fill="currentColor" />
          <line x1={0} y1={-4} x2={0} y2={3} />
          <line x1={0} y1={-2} x2={-3} y2={1} />
          <line x1={0} y1={-2} x2={3} y2={1} />
          <line x1={0} y1={3} x2={-2} y2={7} />
          <line x1={0} y1={3} x2={2} y2={7} />
        </g>
        <g transform="translate(-82 -78)">
          <circle cx={0} cy={-6} r={1.2} fill="currentColor" />
          <line x1={0} y1={-4} x2={0} y2={2} />
          <line x1={0} y1={-2} x2={3} y2={0} />
          <line x1={0} y1={2} x2={-2} y2={6} />
          <line x1={0} y1={2} x2={2} y2={6} />
        </g>
        <g transform="translate(160 -78)">
          <circle cx={0} cy={-6} r={1.4} fill="currentColor" />
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
        fill="currentColor"
        opacity={0.45}
      >
        — sahil yolu —
      </text>

      <g stroke="currentColor" strokeWidth="0.7" fill="none" opacity={0.55}>
        <line x1={-340} y1={-68} x2={340} y2={-68} />
        <line x1={-340} y1={-64} x2={340} y2={-64} />
        {Array.from({ length: 18 }, (_, i) => {
          const fx = -340 + i * 40;
          return <line key={i} x1={fx} y1={-70} x2={fx} y2={-61} />;
        })}
      </g>
      {/* "↓ giriş" — çitler hizasında vurgulu, paper rect arkaplanı */}
      <rect x={-30} y={-71} width={60} height={12} fill="#f3ead8" />
      <text
        x={0}
        y={-62}
        textAnchor="middle"
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={10}
        fontWeight={500}
        fill="currentColor"
        opacity={0.8}
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
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="3 4"
        opacity={0.5}
      />
      <text
        x={-360}
        y={48}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={13}
        fontWeight={500}
        fill="currentColor"
        opacity={0.75}
      >
        iç salon
      </text>

      {/* Tabela + mutfak şeridi — mobile'da yer kaplamasın diye render
          edilmez. ViewBox da mobile'da y=100'de kırpılır. */}
      {!isMobile && (
        <>
      <g transform="translate(0 100)">
        <rect
          x={-150}
          y={-9}
          width={300}
          height={18}
          fill="#f3ead8"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity={0.9}
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
          fontFamily="var(--font-spectral), serif"
          fontSize={13}
          fill="currentColor"
          letterSpacing="0.08em"
        >
          ÇALIŞ BALIKÇISI
        </text>
        <path
          d="M-168 0 q3 -3 7 0 q4 3 7 0 l-3 0 l3 3 l-3 0 q-4 -3 -7 0 q-4 3 -7 0 z"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M168 0 q-3 -3 -7 0 q-4 3 -7 0 l3 0 l-3 3 l3 0 q4 -3 7 0 q4 3 7 0 z"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
      </g>

      <rect
        x={-380}
        y={112}
        width={760}
        height={64}
        fill="currentColor"
        fillOpacity={0.06}
      />
      <line
        x1={-380}
        y1={124}
        x2={380}
        y2={124}
        stroke="currentColor"
        strokeWidth="0.6"
        strokeDasharray="3 3"
        opacity={0.5}
      />
      <g stroke="currentColor" strokeWidth="0.7" fill="none" opacity={0.5}>
        {[-260, -90, 90, 260].map((sx, i) => (
          <g key={i}>
            <path d={`M${sx - 30} 120 L${sx - 24} 114 L${sx + 24} 114 L${sx + 30} 120`} />
            <path d={`M${sx - 6} 114 q-2 -4 0 -8 q2 -4 0 -8`} opacity={0.4} />
            <path d={`M${sx + 6} 114 q-2 -4 0 -8 q2 -4 0 -8`} opacity={0.4} />
          </g>
        ))}
      </g>
      <g
        fill="#d97a3c"
        fillOpacity={tokens.flameOpacity}
        stroke="currentColor"
        strokeWidth="0.5"
      >
        {[-260, -90, 90, 260].map((sx, i) => (
          <g key={i}>
            <path
              d={`M${sx - 16} 134 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 l0 4 l-30 0 z`}
            />
          </g>
        ))}
      </g>
      <g opacity={tokens.chefOpacity}>
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
              stroke="currentColor"
              strokeWidth="0.7"
            />
            <line x1={-6} y1={-22} x2={-6} y2={-2} stroke="currentColor" strokeWidth="0.4" opacity={0.6} />
            <line x1={6} y1={-22} x2={6} y2={-2} stroke="currentColor" strokeWidth="0.4" opacity={0.6} />
            <line x1={-2} y1={-22} x2={-2} y2={-26} stroke="currentColor" strokeWidth="1.2" />
            <line x1={2} y1={-22} x2={2} y2={-26} stroke="currentColor" strokeWidth="1.2" />
            <circle cx={0} cy={-31} r={4.2} fill="#e8d4b0" stroke="currentColor" strokeWidth="0.7" />
            <line x1={-2} y1={-31} x2={-1} y2={-30} stroke="currentColor" strokeWidth="0.5" />
            <path
              d="M-5 -35 q-3 -2 -3 -6 q0 -5 4 -5 q1 -3 4 -3 q3 0 4 3 q4 0 4 5 q0 4 -3 6 z"
              fill="#f3ead8"
              stroke="currentColor"
              strokeWidth="0.7"
            />
            <line x1={-5} y1={-35} x2={5} y2={-35} stroke="currentColor" strokeWidth="0.5" />
            <path
              d={`M${c.facing * 10} -20 Q${c.facing * 16} -14 ${c.facing * 18} -8`}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M${c.facing * 18} -8 Q${c.facing * 22} -4 ${c.facing * 24} 2`}
              stroke="currentColor"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            <circle
              cx={c.facing * 24}
              cy={2}
              r={1.4}
              fill="#e8d4b0"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1={c.facing * 24}
              y1={2}
              x2={c.facing * 32}
              y2={-2}
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x={c.facing > 0 ? 31 : -34}
              y={-4}
              width={3}
              height={3}
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
            />
          </g>
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="0.6" fill="none" opacity={0.55}>
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
        fill="currentColor"
        opacity={0.55}
      >
        mutfak — ızgara
      </text>
        </>
      )}

      <text
        x={-360}
        y={-184}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={13}
        fill="currentColor"
        opacity={0.55}
      >
        Çalış sahili
      </text>

      {/* Tekne — sun/moon ile aynı tek-katman motion.g pattern (kanıtlanmış
          animasyon davranışı). Scale (0,0) etrafında — tekne path'leri
          orijin civarı çizildiği için kabul edilebilir. boatY desktop
          viewBox y=-190..190 içinde tutuldu (sky/wave horizon bandı). */}
      <motion.g
        animate={{
          x: tokens.boatX,
          y: tokens.boatY,
          scale: tokens.boatScale,
          opacity: tokens.boatOpacity,
        }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
        aria-hidden="true"
      >
        <g
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
          opacity={0.55}
        >
          <path d="M-10 0 q10 4 20 0 l-2 -4 l-16 0 z" />
          <line x1={0} y1={0} x2={0} y2={-14} />
          <path d="M0 -14 l8 12 l-8 0 z" />
        </g>
      </motion.g>
      <g
        transform="translate(280 -109)"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity={0.4}
      >
        <path d="M-7 0 q7 3 14 0 l-1.5 -3 l-11 0 z" />
        <line x1={0} y1={0} x2={0} y2={-10} />
        <path d="M0 -10 l5 8 l-5 0 z" />
      </g>

      {/* Martılar — 6 deterministik slot. tokens.seagullCount ilk N'in
          opacity'sini açar (smooth fade), her bir martı sürekli sağa
          doğru yatay uçar (linear loop, 30-55s aralığı, stagger delay).
          Y'de hafif dalgalanma uçuş hissi. Reduced-motion'da statik. */}
      <g stroke="currentColor" strokeWidth="0.5" fill="none">
        {DESKTOP_SEAGULL_POSITIONS.map((pos, i) => (
          <motion.path
            key={i}
            d={`M${pos.x} ${pos.y} q3 -3 6 0 q3 -3 6 0`}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: i < tokens.seagullCount ? 0.5 : 0,
              x: reducedMotion ? 0 : [0, 80, 160, 240, 320, 0],
              y: reducedMotion ? 0 : [0, -8, 4, -6, 2, 0],
            }}
            transition={{
              opacity: {
                duration: reducedMotion ? 0 : 0.8,
                ease: 'easeOut',
              },
              x: {
                duration: reducedMotion ? 0 : 30 + i * 5,
                repeat: reducedMotion ? 0 : Infinity,
                ease: 'linear',
                delay: reducedMotion ? 0 : i * 2,
              },
              y: {
                duration: reducedMotion ? 0 : 30 + i * 5,
                repeat: reducedMotion ? 0 : Infinity,
                ease: 'linear',
                delay: reducedMotion ? 0 : i * 2,
              },
            }}
            aria-hidden="true"
          />
        ))}
      </g>
    </g>
  );
}

// Mobile portre kompoz — viewBox 400×700, sahne dikey: sky → dalga → kum →
// sahil yolu → çitler → dış masalar (3 sıra) → iç salon zone (2 sıra).
// Tüm koordinatlar -200..+200 x range içinde sıkıştırılmış. Sun (cx=-100)
// ve moon (cx=+80) konumları sabit; token sadece y/opacity hareketi sürer.
// Mobile sun cy lookup — deniz şimdi y=-260'a kadar yukarı genişlediği
// için sun aralığı da yukarı kaldırıldı. 17:30'da tepe (-310), 19:00 yarı
// batık (-230, ufuk seviyesinde), 20:00 batma (-170), 20:30+ görünmez.
const MOBILE_SUN_CY: Record<TimeKey, number> = {
  '17:30': -310,
  '18:00': -290,
  '18:30': -260,
  '19:00': -230,
  '19:30': -200,
  '20:00': -170,
  '20:30': -140,
  '21:00': -140,
  '21:30': -140,
  '22:00': -140,
  '22:30': -140,
};

// Mobile moon cy lookup — 19:30 denizden doğuş (-160), 22:30 tepe (-345).
// Sky alanı genişlediği için yüksek değerler -340 civarına çıkarıldı.
const MOBILE_MOON_CY: Record<TimeKey, number> = {
  '17:30': -200,
  '18:00': -200,
  '18:30': -200,
  '19:00': -200,
  '19:30': -160,
  '20:00': -200,
  '20:30': -240,
  '21:00': -280,
  '21:30': -310,
  '22:00': -330,
  '22:30': -345,
};

function MobileSeaBackdrop({
  tokens,
  reducedMotion,
  timeKey,
}: MobileBackdropProps) {
  // Hand-drawn waves — dar viewBox için yeniden generated.
  const wave = (y: number, amp = 1.5, phase = 0) => {
    const start = -200;
    const end = 200;
    let d = `M${start} ${y}`;
    let xCur = start;
    let i = 0;
    while (xCur < end) {
      const seed = (i * 13 + phase) % 100;
      const step = 16 + (seed % 12);
      const dir = i % 2 === 0 ? -1 : 1;
      const xMid = xCur + step / 2;
      const yPeak = y + dir * amp * 0.8;
      d += ` Q${xMid} ${yPeak} ${xCur + step} ${y + ((seed % 3) - 1) * 0.4}`;
      xCur += step;
      i++;
    }
    return d;
  };

  // Sun/moon mobile cy lookup'tan okunur. Multiplier yaklaşımı bırakıldı —
  // her saat dilimi için elle kalibre edilmiş pozisyonlar daha iyi sonuç
  // veriyor (sun batış dalga ufkuna oturur, ay denizden doğar).
  const sunCy = MOBILE_SUN_CY[timeKey];
  const moonCy = MOBILE_MOON_CY[timeKey];

  return (
    <g opacity={0.75} style={{ color: 'var(--rez-ink)' }}>
      {/* "Çalış sahili" — sahnenin tepe sol kısmı, viewBox başlangıcına yakın */}
      <text
        x={-180}
        y={-330}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={11}
        fill="currentColor"
        opacity={0.5}
      >
        Çalış sahili
      </text>

      {/* Güneş — cx=-100 sabit, cy lookup'tan; r=42 (büyütüldü).
          17:30 cy=-260 (tepe), 19:00 cy=-195 (yarı batma), 20:00 cy=-145
          (dalga ufkuna gömülür). */}
      <motion.g
        animate={{ y: sunCy, opacity: tokens.sunOpacity }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ x: -100 }}
      >
        <g className={styles.ambientSun}>
          <circle
            cx={0}
            cy={0}
            r={42}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            fill="rgba(217,122,60,.18)"
          />
          <circle cx={0} cy={0} r={24} fill="#d97a3c" fillOpacity={0.15} />
        </g>
      </motion.g>

      {/* Ay — cx=+80 sabit, cy lookup'tan; r=38 (büyütüldü).
          19:30 cy=-150 (denizden doğuş, hilal), 22:30 cy=-310 (tepe, tam ay).
          Faz gölgesi r ve cx/cy ölçeği yeni r=38'e göre orantılı (×1.46). */}
      {tokens.moonOpacity > 0 && (
        <motion.g
          animate={{ y: moonCy, opacity: tokens.moonOpacity }}
          transition={{
            duration: reducedMotion ? 0 : 1,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{ x: 80 }}
          aria-hidden="true"
        >
          <circle
            cx={0}
            cy={0}
            r={38}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            fill="rgba(245,235,210,0.85)"
            opacity={0.9}
          />
          {tokens.moonPhase < 1 && (
            <circle
              cx={(1 - tokens.moonPhase) * 35}
              cy={(1 - tokens.moonPhase) * 24}
              r={38 - tokens.moonPhase * 7}
              fill="var(--rez-sky-top)"
            />
          )}
          {tokens.moonPhase > 0.7 && (
            <>
              <circle cx={-9} cy={-6} r={3.6} fill="currentColor" opacity={0.25} />
              <circle cx={12} cy={9} r={2.4} fill="currentColor" opacity={0.2} />
            </>
          )}
        </motion.g>
      )}

      {/* Dalgalar — y=-260..-110 (150 birim, deniz büyüdü). Sky boşluğunu
          doldurur; masalar ve aşağısı aynı yerde kalır. 8 path ~21 birim
          aralık. */}
      <g
        className={styles.ambientSea}
        stroke="var(--rez-wave-stroke)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={wave(-260, 1.2, 3)} strokeWidth="0.5" opacity={0.4} />
        <path d={wave(-238, 1.4, 18)} strokeWidth="0.5" opacity={0.45} />
        <path d={wave(-216, 1.8, 41)} strokeWidth="0.6" opacity={0.5} />
        <path d={wave(-194, 2, 17)} strokeWidth="0.7" opacity={0.55} />
        <path d={wave(-172, 2, 63)} strokeWidth="0.8" opacity={0.65} />
        <path d={wave(-150, 1.8, 29)} strokeWidth="0.6" opacity={0.5} />
        <path d={wave(-128, 1.4, 51)} strokeWidth="0.55" opacity={0.45} />
        <path d={wave(-110, 1.2, 8)} strokeWidth="0.4" opacity={0.35} />
      </g>

      {/* Sun glitter — sun cx=-100, ufukta y=-115..-105 kompakt yansıma */}
      <motion.g
        stroke="#d97a3c"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        animate={{ opacity: tokens.sunGlitterOpacity }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <path d="M-114 -113 l8 0" />
        <path d="M-98 -109 l12 -1" />
        <path d="M-78 -111 l14 -2" />
        <path d="M-58 -107 l16 -2" />
      </motion.g>

      {/* Moon glitter — ay cx=+80, ufukta y=-115..-105 */}
      <motion.g
        stroke="rgba(245,235,210,0.9)"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
        animate={{ opacity: tokens.moonGlitterOpacity }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <path d="M64 -110 l8 0" />
        <path d="M76 -113 l12 -1" />
        <path d="M92 -107 l8 0" />
      </motion.g>

      {/* Kum band y=-110..-82 (h=28, deniz büyüdüğü için biraz büyüdü) */}
      <rect
        x={-200}
        y={-110}
        width={400}
        height={28}
        fill="var(--rez-sand)"
        fillOpacity={0.6}
      />
      <rect
        x={-200}
        y={-110}
        width={400}
        height={28}
        fill="#d97a3c"
        fillOpacity={0.06}
      />
      <g fill="currentColor" opacity={0.28}>
        {Array.from({ length: 36 }, (_, i) => {
          const sx = -195 + i * 11 + ((i * 31) % 7);
          const sy = -107 + ((i * 17) % 24);
          return <circle key={i} cx={sx} cy={sy} r={0.7} />;
        })}
      </g>

      {/* Sahil yolu y=-82..-68 (kum kaydığı için kaydı, kalınlık 14 aynı) */}
      <rect x={-200} y={-82} width={400} height={14} fill="#f3ead8" />
      <line
        x1={-200}
        y1={-82}
        x2={200}
        y2={-82}
        stroke="currentColor"
        strokeWidth="0.7"
        opacity={0.5}
      />
      <line
        x1={-200}
        y1={-68}
        x2={200}
        y2={-68}
        stroke="currentColor"
        strokeWidth="0.7"
        opacity={0.5}
      />
      <g stroke="currentColor" strokeWidth="0.5" opacity={0.38}>
        {Array.from({ length: 16 }, (_, i) => {
          const lx = -190 + i * 26;
          return <line key={i} x1={lx} y1={-82} x2={lx} y2={-68} />;
        })}
      </g>

      {/* Çit y=-68..-58 */}
      <g stroke="currentColor" strokeWidth="0.7" fill="none" opacity={0.55}>
        <line x1={-190} y1={-64} x2={190} y2={-64} />
        <line x1={-190} y1={-60} x2={190} y2={-60} />
        {Array.from({ length: 14 }, (_, i) => {
          const fx = -185 + i * 28;
          return <line key={i} x1={fx} y1={-66} x2={fx} y2={-58} />;
        })}
      </g>
      {/* "↓ giriş" — çitler ile masalar arası boşlukta vurgulu, paper
          arkaplan rect ile çitlere binmesin */}
      <rect x={-25} y={-72} width={50} height={11} fill="#f3ead8" />
      <text
        x={0}
        y={-64}
        textAnchor="middle"
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={11}
        fontWeight={500}
        fill="currentColor"
        opacity={0.8}
      >
        ↓ giriş
      </text>

      {/* İç salon zone y=95..220 (h=125, indoor masalar y=130 ve y=185 içinde).
          Aşağı kaydırıldı — dış masalar y=-40..+50 alanında, iç salon altında. */}
      <rect
        x={-200}
        y={95}
        width={400}
        height={125}
        fill="#ead9b8"
        fillOpacity={0.35}
      />
      <line
        x1={-200}
        y1={95}
        x2={200}
        y2={95}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="3 4"
        opacity={0.5}
      />
      <text
        x={-180}
        y={110}
        fontFamily="var(--font-spectral), serif"
        fontStyle="italic"
        fontSize={12}
        fontWeight={500}
        fill="currentColor"
        opacity={0.75}
      >
        iç salon
      </text>

      {/* Tekne — sun/moon ile aynı tek-katman motion.g pattern. Mobile X/Y
          ayrı lookup tablosundan (mobil viewBox -200..+200, sky deniz
          üstünde -350..-260). Scale/opacity ortak token. */}
      <motion.g
        animate={{
          x: MOBILE_BOAT_X[timeKey],
          y: MOBILE_BOAT_Y[timeKey],
          scale: tokens.boatScale,
          opacity: tokens.boatOpacity,
        }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: [0.4, 0, 0.2, 1],
        }}
        aria-hidden="true"
      >
        <g
          stroke="currentColor"
          strokeWidth="0.7"
          fill="none"
          opacity={0.5}
        >
          <path d="M-9 0 q9 4 18 0 l-2 -4 l-14 0 z" />
          <line x1={0} y1={0} x2={0} y2={-12} />
          <path d="M0 -12 l7 10 l-7 0 z" />
        </g>
      </motion.g>

      {/* Martılar — 6 deterministik slot (sky tepesinde, y=-340..-300).
          tokens.seagullCount ilk N'in opacity'sini açar; her martı sağa
          doğru yatay loop'ta uçar (mobil viewBox 400 geniş → x range 0..200).
          Y'de hafif dalga, stagger delay ile bağımsız hareket. */}
      <g stroke="currentColor" strokeWidth="0.5" fill="none">
        {MOBILE_SEAGULL_POSITIONS.map((pos, i) => (
          <motion.path
            key={i}
            d={`M${pos.x} ${pos.y} q3 -3 6 0 q3 -3 6 0`}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: i < tokens.seagullCount ? 0.5 : 0,
              x: reducedMotion ? 0 : [0, 50, 100, 150, 200, 0],
              y: reducedMotion ? 0 : [0, -6, 3, -4, 2, 0],
            }}
            transition={{
              opacity: {
                duration: reducedMotion ? 0 : 0.8,
                ease: 'easeOut',
              },
              x: {
                duration: reducedMotion ? 0 : 30 + i * 5,
                repeat: reducedMotion ? 0 : Infinity,
                ease: 'linear',
                delay: reducedMotion ? 0 : i * 2,
              },
              y: {
                duration: reducedMotion ? 0 : 30 + i * 5,
                repeat: reducedMotion ? 0 : Infinity,
                ease: 'linear',
                delay: reducedMotion ? 0 : i * 2,
              },
            }}
            aria-hidden="true"
          />
        ))}
      </g>

      {/* Mutfak şeridi — alt boşluğu doldurur (y=240..340), kompakt versiyon.
          Indoor zone bottom (y=220) ile viewBox bottom (y=250 normal / 250
          expanded) arasında dar bant; viewBox NORMAL altında 30 birim
          görünür kalır, EXPANDED'da daha fazlası. Slice/meet ile letterbox
          alanı zaten paper rengi. */}
      <g>
        <rect
          x={-200}
          y={240}
          width={400}
          height={100}
          fill="currentColor"
          fillOpacity={0.06}
        />
        <line
          x1={-200}
          y1={240}
          x2={200}
          y2={240}
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="3 3"
          opacity={0.5}
        />

        {/* "ÇALIŞ BALIKÇISI" tabela (kompakt) */}
        <g transform="translate(0 254)">
          <rect
            x={-100}
            y={-7}
            width={200}
            height={14}
            fill="#f3ead8"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity={0.9}
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fontFamily="var(--font-spectral), serif"
            fontSize={9}
            fill="currentColor"
            letterSpacing="0.06em"
          >
            ÇALIŞ BALIKÇISI
          </text>
          {/* Yan balık ornament'ları */}
          <path
            d="M-115 0 q2 -2 5 0 q3 2 5 0 l-2 0 l2 2 l-2 0 q-3 -2 -5 0 q-3 2 -5 0 z"
            stroke="currentColor"
            strokeWidth="0.4"
            fill="none"
          />
          <path
            d="M115 0 q-2 -2 -5 0 q-3 2 -5 0 l2 0 l-2 2 l2 0 q3 -2 5 0 q3 2 5 0 z"
            stroke="currentColor"
            strokeWidth="0.4"
            fill="none"
          />
        </g>

        {/* Şef figürü — minimalist sembolik (sketch tarzı). İki dikey gövde
            çizgisi + omuz + toque ellipse + bant + tek çalışan kol. Gerçekçi
            anatomi yerine "burada şef var" hissi. */}
        <g opacity={tokens.chefOpacity}>
          {[
            { x: -100, facing: 1 },
            { x: 100, facing: -1 },
          ].map((c, i) => (
            <g key={i} transform={`translate(${c.x} 320)`}>
              {/* Gövde — iki paralel dikey çizgi */}
              <line x1={-3} y1={-2} x2={-3} y2={-22} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1={3} y1={-2} x2={3} y2={-22} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              {/* Omuz çizgisi */}
              <line x1={-3} y1={-22} x2={3} y2={-22} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              {/* Toque şapka */}
              <ellipse cx={0} cy={-27} rx={4} ry={4} fill="#f3ead8" stroke="currentColor" strokeWidth="0.8" />
              {/* Şapka altı bant */}
              <line x1={-3.5} y1={-23.5} x2={3.5} y2={-23.5} stroke="currentColor" strokeWidth="0.6" />
              {/* Çalışan kol — ızgaraya uzanır */}
              <path
                d={`M${c.facing * 3} -18 Q${c.facing * 10} -14 ${c.facing * 15} -8`}
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Spatula ucu */}
              <line x1={c.facing * 15} y1={-8} x2={c.facing * 20} y2={-11} stroke="currentColor" strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* Izgara alevleri (2 lokasyon, şef altında) */}
        <g
          fill="#d97a3c"
          fillOpacity={tokens.flameOpacity * 0.8}
          stroke="currentColor"
          strokeWidth="0.4"
        >
          {[-100, 100].map((x, i) => (
            <g key={i} transform={`translate(${x} 305)`}>
              <path d="M-12 0 q2 -6 4 -1 q2 -6 4 -1 q2 -6 4 -1 q2 -6 4 -1 q2 -6 4 -1 l0 3 l-24 0 z" />
            </g>
          ))}
        </g>

        {/* Izgara balıkları (alev üzerinde) */}
        <g stroke="currentColor" strokeWidth="0.4" fill="none" opacity={0.55}>
          {[-100, 100].map((x, i) => (
            <g key={i} transform={`translate(${x} 300)`}>
              <path d="M-5 0 q2 -2 5 0 q3 2 5 0 l-2 0 l2 2 l-2 0 q-3 -2 -5 0 q-3 2 -5 0 z" />
            </g>
          ))}
        </g>

        {/* "mutfak — ızgara" italic etiketi */}
        <text
          x={-190}
          y={335}
          fontFamily="var(--font-spectral), serif"
          fontStyle="italic"
          fontSize={9}
          fill="currentColor"
          opacity={0.55}
        >
          mutfak — ızgara
        </text>
      </g>
    </g>
  );
}

type Props = {
  selectedId: string | null;
  flightId: string | null;
  isDesktop: boolean;
  isMobile: boolean;
  /** Panel açık mı? Mobile'da viewBox'ı genişletmek için kullanılır. */
  isPanelOpen: boolean;
  reducedMotion: boolean;
  tokens: AtmosphereTokens;
  /** Mobile sun/moon cy lookup'ı için saat anahtarı. */
  timeKey: TimeKey;
  onSelect: (id: string) => void;
};

function statusFor(
  id: string,
  flightId: string | null,
): TableStatus {
  if (TAKEN_IDS.has(id)) return 'taken';
  if (flightId === id) return 'selected';
  return 'free';
}

export function IsoMap({
  selectedId,
  flightId,
  isDesktop,
  isMobile,
  isPanelOpen,
  reducedMotion,
  tokens,
  timeKey,
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
        // Desktop: mevcut viewBox sabit. Mobile: portre kompoz, panel kapalı
        // iken NORMAL, açık iken EXPANDED (sky alanı yukarıya genişler).
        // ViewBox attribute animation tarayıcılar arası inconsistent → anlık
        // değişim, header fade (300ms) ile maskeleniyor.
        viewBox={
          isMobile
            ? (() => {
                const vb = isPanelOpen
                  ? VB_MOBILE_EXPANDED
                  : VB_MOBILE_NORMAL;
                return `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;
              })()
            : `-${VB_W / 2} -${VB_H / 2} ${VB_W} ${VB_H}`
        }
        preserveAspectRatio={isMobile ? 'xMidYMid meet' : 'xMidYMid meet'}
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

        <SeaBackdrop
          tokens={tokens}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          timeKey={timeKey}
        />

        <g>
          {orderedTables.map((t) => {
            const pos = isMobile
              ? getMobileTablePosition(t)
              : { x: t.x, y: t.y };
            return (
              <FlatTable
                key={t.id}
                table={t}
                index={indexMap.get(t.id) ?? 0}
                status={statusFor(t.id, flightId)}
                isDesktop={isDesktop}
                isMobile={isMobile}
                reducedMotion={reducedMotion}
                flightTarget={flightTarget}
                tableX={pos.x}
                tableY={pos.y}
                onSelect={onSelect}
                onHover={setHover}
                onLeave={() => setHover(null)}
              />
            );
          })}
        </g>

        {!isMobile && (
          <text
            x={VB_W / 2 - 16}
            y={VB_H / 2 - 14}
            textAnchor="end"
            fontFamily="var(--font-spectral), serif"
            fontStyle="italic"
            fontSize={11}
            fill="currentColor"
            opacity={0.4}
          >
            — ışık 18:42 civarı
          </text>
        )}
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
