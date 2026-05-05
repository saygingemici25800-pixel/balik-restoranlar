// Saat → atmosfer token eşlemesi.
// 11 ayrı saat slotu, her birinin kendi rengi/güneş/ay pozisyonu.
// Geçişler 1000ms cubic-bezier ile smooth interpolate olur (CSS @property
// + Framer Motion).
//
// 19:00 default — mevcut "gün batımı" estetiğiyle birebir uyumlu (regression
// olmasın). Diğer saatler 19:00'dan kademeli iki yöne dağılır.

export type TimeKey =
  | '17:30'
  | '18:00'
  | '18:30'
  | '19:00'
  | '19:30'
  | '20:00'
  | '20:30'
  | '21:00'
  | '21:30'
  | '22:00'
  | '22:30';

export type AtmosphereTokens = {
  /** Sky gradient üst rengi. */
  skyTop: string;
  /** Sky gradient alt rengi. */
  skyBottom: string;
  /** Sand band fill. */
  sand: string;
  /** Genel ink rengi (text/stroke). currentColor mirası. */
  ink: string;
  /** Wave path stroke rengi. */
  waveStroke: string;
  /** FlatTable "free" rect fill. */
  tableFill: string;
  /** Güneş g'sinin opacity'si. */
  sunOpacity: number;
  /** Güneş x koordinatı (viewBox user units). Default -310 (sol-uç). */
  sunCx: number;
  /** Güneş y koordinatı. */
  sunCy: number;
  /** Ay g'sinin opacity'si. */
  moonOpacity: number;
  /** Ay x koordinatı. Default -80 (sol-orta, panel açıkken görünür). */
  moonCx: number;
  /** Ay y koordinatı. */
  moonCy: number;
  /** Ay olgunluk fazı: 0=invisible, 0.3=yarım ay (sol kesik),
   *  0.7=gibbous, 1.0=tam ay. */
  moonPhase: number;
  /** Şefler g opacity. */
  chefOpacity: number;
  /** Grill flames fill opacity. */
  flameOpacity: number;
  /** Sun glitter (turuncu yansımalar) opacity. */
  sunGlitterOpacity: number;
  /** Moon glitter (krem ay yansıması) opacity. */
  moonGlitterOpacity: number;
  /** Tekne x pozisyonu (viewBox user units, pozitif = sağa kayar). */
  boatX: number;
  /** Tekne y pozisyonu (negatif = ufka yakın / yukarıda). */
  boatY: number;
  /** Tekne ölçeği (1 = yakın, 0.3 = uzak ufuk). */
  boatScale: number;
  /** Tekne opacity (1 → 0 ufukta kaybolur). */
  boatOpacity: number;
  /** Sky'da görünür martı sayısı (0–6, deterministik). */
  seagullCount: number;
};

/** Güneşin başlangıç x pozisyonu (17:30'da sol uçta). Glitter offset
 *  hesabında referans olarak kullanılır. */
export const SUN_BASE_CX = -310;
const DEFAULT_MOON_CX = -80;

/**
 * 11 saat × 21 alan token tablosu. Renkler kademeli kayar.
 * Sky %15-20 koyulaşır her 30dk. Sand 19:30'dan grileşir. Ink 20:00-21:00
 * arası kritik geçişte koyu→krem'e döner. Tekne saat ilerledikçe ufka
 * doğru kayar + küçülür + kaybolur. Martı sayısı akşam azalır.
 */
export const TIME_TOKENS: Record<TimeKey, AtmosphereTokens> = {
  '17:30': {
    skyTop: '#f5e6c8',
    skyBottom: '#f3d9a8',
    sand: '#ead9b8',
    ink: '#1f1a12',
    waveStroke: '#1f1a12',
    tableFill: 'rgba(255,255,255,0.5)',
    sunOpacity: 1,
    sunCx: SUN_BASE_CX, // 17:30 — en sol uç, başlangıç
    sunCy: -170,
    moonOpacity: 0,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -90,
    moonPhase: 0,
    chefOpacity: 0.88,
    flameOpacity: 0.5,
    sunGlitterOpacity: 0.6,
    moonGlitterOpacity: 0,
    boatX: 60,
    boatY: -130,
    boatScale: 1.0,
    boatOpacity: 1,
    seagullCount: 4,
  },
  '18:00': {
    skyTop: '#f5d4a8',
    skyBottom: '#f0c280',
    sand: '#e8d3b0',
    ink: '#1f1a12',
    waveStroke: '#1f1a12',
    tableFill: 'rgba(255,255,255,0.5)',
    sunOpacity: 1,
    sunCx: -290, // 18:00
    sunCy: -160,
    moonOpacity: 0,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -90,
    moonPhase: 0,
    chefOpacity: 0.88,
    flameOpacity: 0.52,
    sunGlitterOpacity: 0.55,
    moonGlitterOpacity: 0,
    boatX: 80,
    boatY: -138,
    boatScale: 0.95,
    boatOpacity: 1,
    seagullCount: 5,
  },
  '18:30': {
    skyTop: '#f5c290',
    skyBottom: '#ea9560',
    sand: '#e6c9a0',
    ink: '#1f1a12',
    waveStroke: '#1f1a12',
    tableFill: 'rgba(255,255,255,0.5)',
    sunOpacity: 1,
    sunCx: -260, // 18:30
    sunCy: -145,
    moonOpacity: 0,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -90,
    moonPhase: 0,
    chefOpacity: 0.88,
    flameOpacity: 0.55,
    sunGlitterOpacity: 0.55,
    moonGlitterOpacity: 0,
    boatX: 110,
    boatY: -146,
    boatScale: 0.85,
    boatOpacity: 0.95,
    seagullCount: 4,
  },
  // 19:00 — eski faz 2 (mevcut default estetik). Regresyon olmasın.
  '19:00': {
    skyTop: '#f5b889',
    skyBottom: '#d97a3c',
    sand: '#e6c9a0',
    ink: '#1f1a12',
    waveStroke: '#1f1a12',
    tableFill: 'rgba(255,255,255,0.5)',
    sunOpacity: 1,
    sunCx: -220, // 19:00 — ay'a kayma başladı
    sunCy: -130,
    moonOpacity: 0,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -90,
    moonPhase: 0,
    chefOpacity: 0.85,
    flameOpacity: 0.58,
    sunGlitterOpacity: 0.5,
    moonGlitterOpacity: 0,
    boatX: 140,
    boatY: -154,
    boatScale: 0.75,
    boatOpacity: 0.85,
    seagullCount: 3,
  },
  '19:30': {
    skyTop: '#e09870',
    skyBottom: '#b56050',
    sand: '#dab895',
    ink: '#2a241a',
    waveStroke: '#2a241a',
    tableFill: 'rgba(252,245,225,0.55)',
    sunOpacity: 0.7,
    sunCx: -170, // 19:30 — ay'a yarı yolda
    sunCy: -115,
    moonOpacity: 0.2,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -90,
    moonPhase: 0.3,
    chefOpacity: 0.78,
    flameOpacity: 0.62,
    sunGlitterOpacity: 0.4,
    moonGlitterOpacity: 0.15,
    boatX: 170,
    boatY: -161,
    boatScale: 0.65,
    boatOpacity: 0.7,
    seagullCount: 3,
  },
  '20:00': {
    skyTop: '#b8997b',
    skyBottom: '#6b4470',
    sand: '#c8b896',
    ink: '#5a4a30',
    waveStroke: '#3a3540',
    tableFill: 'rgba(248,238,215,0.6)',
    sunOpacity: 0.3,
    sunCx: -130, // 20:00 — ay'a en yakın, neredeyse battı (~50px ay'dan uzak)
    sunCy: -100,
    moonOpacity: 0.5,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -110,
    moonPhase: 0.5,
    chefOpacity: 0.7,
    flameOpacity: 0.65,
    sunGlitterOpacity: 0.2,
    moonGlitterOpacity: 0.3,
    boatX: 200,
    boatY: -167,
    boatScale: 0.55,
    boatOpacity: 0.55,
    seagullCount: 2,
  },
  '20:30': {
    skyTop: '#8a7585',
    skyBottom: '#4d3858',
    sand: '#b8a888',
    ink: '#8a7a5a',
    waveStroke: '#2a3540',
    tableFill: 'rgba(245,235,210,0.65)',
    sunOpacity: 0,
    sunCx: -130, // 20:30+ — sun opacity 0, cx önemsiz ama son konumda kalır
    sunCy: -100,
    moonOpacity: 0.75,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -130,
    moonPhase: 0.7,
    chefOpacity: 0.62,
    flameOpacity: 0.72,
    sunGlitterOpacity: 0,
    moonGlitterOpacity: 0.45,
    boatX: 220,
    boatY: -172,
    boatScale: 0.45,
    boatOpacity: 0.4,
    seagullCount: 2,
  },
  '21:00': {
    skyTop: '#5a5878',
    skyBottom: '#2c3e50',
    sand: '#8c7d6a',
    ink: '#b8a890',
    waveStroke: '#1a2535',
    tableFill: 'rgba(245,235,210,0.7)',
    sunOpacity: 0,
    sunCx: -130, // 20:30+ — sun opacity 0, cx önemsiz ama son konumda kalır
    sunCy: -100,
    moonOpacity: 0.9,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -150,
    moonPhase: 0.85,
    chefOpacity: 0.55,
    flameOpacity: 0.8,
    sunGlitterOpacity: 0,
    moonGlitterOpacity: 0.6,
    boatX: 240,
    boatY: -177,
    boatScale: 0.4,
    boatOpacity: 0.25,
    seagullCount: 1,
  },
  '21:30': {
    skyTop: '#3a4560',
    skyBottom: '#1f2c40',
    sand: '#786a55',
    ink: '#d0c0a0',
    waveStroke: '#15202d',
    tableFill: 'rgba(245,235,210,0.72)',
    sunOpacity: 0,
    sunCx: -130, // 20:30+ — sun opacity 0, cx önemsiz ama son konumda kalır
    sunCy: -100,
    moonOpacity: 0.95,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -170,
    moonPhase: 0.95,
    chefOpacity: 0.5,
    flameOpacity: 0.85,
    sunGlitterOpacity: 0,
    moonGlitterOpacity: 0.7,
    boatX: 250,
    boatY: -181,
    boatScale: 0.35,
    boatOpacity: 0.15,
    seagullCount: 1,
  },
  '22:00': {
    skyTop: '#1a2540',
    skyBottom: '#0d1a2e',
    sand: '#6b5d4a',
    ink: '#d8c8a8',
    waveStroke: '#0d1825',
    tableFill: 'rgba(245,235,210,0.75)',
    sunOpacity: 0,
    sunCx: -130, // 20:30+ — sun opacity 0, cx önemsiz ama son konumda kalır
    sunCy: -100,
    moonOpacity: 1,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -185,
    moonPhase: 1,
    chefOpacity: 0.5,
    flameOpacity: 0.85,
    sunGlitterOpacity: 0,
    moonGlitterOpacity: 0.8,
    boatX: 260,
    boatY: -184,
    boatScale: 0.3,
    boatOpacity: 0.08,
    seagullCount: 0,
  },
  '22:30': {
    skyTop: '#0d1830',
    skyBottom: '#050d1f',
    sand: '#5a4d3a',
    ink: '#d8c8a8',
    waveStroke: '#050f18',
    tableFill: 'rgba(245,235,210,0.75)',
    sunOpacity: 0,
    sunCx: -130, // 20:30+ — sun opacity 0, cx önemsiz ama son konumda kalır
    sunCy: -100,
    moonOpacity: 1,
    moonCx: DEFAULT_MOON_CX,
    moonCy: -195,
    moonPhase: 1,
    chefOpacity: 0.5,
    flameOpacity: 0.85,
    sunGlitterOpacity: 0,
    moonGlitterOpacity: 0.85,
    boatX: 270,
    boatY: -186,
    boatScale: 0.3,
    boatOpacity: 0,
    seagullCount: 0,
  },
};

const FALLBACK: AtmosphereTokens = TIME_TOKENS['17:30'];

export function getAtmosphereTokens(time: string): AtmosphereTokens {
  return TIME_TOKENS[time as TimeKey] ?? FALLBACK;
}
