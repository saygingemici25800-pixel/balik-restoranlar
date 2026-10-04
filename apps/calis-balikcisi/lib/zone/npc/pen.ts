/**
 * Misafir çiziminin ortak kalemi ve başı — **three'siz**. Oturan (`person.ts`) ve ayakta/yürüyen
 * (`person-standing.ts`) çizimler aynı baş, yüz ve saçı kullanır: iki atlasta aynı insan aynı
 * görünür.
 *
 * Renk değil ANAHTAR çizilir (shader paletten boyar):
 *   ten #ff0000 · üst #00ff00 · alt #0000ff · saç/şapka #ffffff · kontur/göz/ayakkabı #000000
 * Görünüm kuralları kahramanla aynı (figure.ts): `back34` ve `side` SOLA bakar.
 */
import type { CharView } from '@/lib/zone/figure';

export const KEY = {
  SKIN: '#ff0000',
  TOP: '#00ff00',
  BOTTOM: '#0000ff',
  HAIR: '#ffffff',
  LINE: '#000000',
} as const;

/** Silüetler: atlas satırları bu sırada (oturan ve ayakta atlasta aynı). */
export const SILS = ['short', 'long', 'elder', 'sunhat', 'bun'] as const;
export type Sil = (typeof SILS)[number];

export type Pt = readonly [number, number];

/**
 * Hücre kalemi: metre → hücre pikseli, (0,0) zemin ortası. `ox, oy` hücrenin sol üst köşesi,
 * `quadW` hücrenin dünyadaki genişliği (m).
 */
export function makePen(x: CanvasRenderingContext2D, ox: number, oy: number, cw: number, ch: number, quadW: number) {
  const P = cw / quadW;
  const X = (m: number) => ox + cw / 2 + m * P;
  const Y = (m: number) => oy + ch - 3 - m * P;
  const L = (m: number) => m * P;
  const stroke = (lw = 2.4) => {
    x.lineWidth = lw;
    x.strokeStyle = KEY.LINE;
    x.stroke();
  };
  const fill = (c: string) => {
    x.fillStyle = c;
    x.fill();
  };
  /** Yuvarlatılmış dikdörtgen: `cx`, `top`, `bottom` metre (yukarıdan aşağı). */
  const rr = (cx: number, top: number, wM: number, bottom: number, r: number) => {
    const px = X(cx - wM / 2);
    const py = Y(top);
    const pw = L(wM);
    const ph = Y(bottom) - py;
    const rad = Math.min(L(r), pw / 2, ph / 2);
    x.beginPath();
    x.moveTo(px + rad, py);
    x.arcTo(px + pw, py, px + pw, py + ph, rad);
    x.arcTo(px + pw, py + ph, px, py + ph, rad);
    x.arcTo(px, py + ph, px, py, rad);
    x.arcTo(px, py, px + pw, py, rad);
    x.closePath();
  };
  const ell = (cx: number, cy: number, rx: number, ry: number) => {
    x.beginPath();
    x.ellipse(X(cx), Y(cy), L(rx), L(ry), 0, 0, Math.PI * 2);
  };
  /** Konturlu uzuv: önce kalın kontur, üstüne renk. */
  const limb = (a: Pt, b: Pt, wM: number, color: string) => {
    x.beginPath();
    x.moveTo(X(a[0]), Y(a[1]));
    x.lineTo(X(b[0]), Y(b[1]));
    x.lineWidth = L(wM) + 4.8;
    x.strokeStyle = KEY.LINE;
    x.stroke();
    x.lineWidth = L(wM);
    x.strokeStyle = color;
    x.stroke();
  };
  const line = (a: Pt, b: Pt, lw = 2.2) => {
    x.beginPath();
    x.moveTo(X(a[0]), Y(a[1]));
    x.lineTo(X(b[0]), Y(b[1]));
    stroke(lw);
  };
  /** Hücreye kırp: komşu hücreye taşma olmasın (mipmap sızıntısı). */
  const begin = () => {
    x.save();
    x.beginPath();
    x.rect(ox + 2, oy + 2, cw - 4, ch - 4);
    x.clip();
    x.lineJoin = 'round';
    x.lineCap = 'round';
  };
  return { x, X, Y, L, stroke, fill, rr, ell, limb, line, begin, end: () => x.restore() };
}
export type Pen = ReturnType<typeof makePen>;

export type HeadSpec = {
  readonly sil: Sil;
  readonly view: CharView;
  readonly headX: number;
  readonly headY: number;
  readonly headR: number;
  readonly shoulderY: number;
  /** Önden yerken ağızdaki el: yüzden SONRA çizilir (yoksa başın altında kalır). */
  readonly bite?: Pt | null;
};

/** Uzun saç önden/yandan: başın ARKASINDA, omuzlara iner — gövdeden ÖNCE çizilir. */
export function drawHairBehind(p: Pen, h: HeadSpec) {
  if (h.sil !== 'long' || (h.view !== 'front' && h.view !== 'side')) return;
  const side = h.view === 'side';
  p.rr(h.headX + (side ? 0.05 : 0), h.headY + 0.06, side ? 0.2 : 0.27, h.shoulderY - 0.12, 0.08);
  p.fill(KEY.HAIR);
  p.stroke();
}

/**
 * Baş + yüz. Kulak çizilmez: bu ölçekte konturlu kulak önden kulaklık, profilde leke gibi
 * okunuyor. Yüz herkes için aynı basitlikte: nokta göz, kısa gülüş.
 */
export function drawHead(p: Pen, h: HeadSpec) {
  const { x, X, Y, L, stroke, fill, ell } = p;
  const { sil, view, headX, headY, headR } = h;
  const side = view === 'side';
  const front = view === 'front';
  const b34 = view === 'back34';
  const elder = sil === 'elder';
  const longHair = sil === 'long';

  ell(headX, headY, side ? headR * 0.95 : headR, headR);
  fill(front || side ? KEY.SKIN : KEY.HAIR);
  stroke();

  if (front) {
    // saç: alın çizgisi; uzun saç yanlarda iner
    x.save();
    ell(headX, headY, headR, headR);
    x.clip();
    x.fillStyle = KEY.HAIR;
    x.fillRect(X(headX - headR), Y(headY + headR), L(headR * 2), L(sil === 'bun' || longHair ? 0.07 : 0.05));
    if (longHair) {
      x.fillRect(X(headX - headR), Y(headY + headR), L(0.025), L(headR * 2));
      x.fillRect(X(headX + headR - 0.025), Y(headY + headR), L(0.025), L(headR * 2));
    }
    x.restore();
    ell(headX, headY, headR, headR);
    stroke();
    for (const ex of [-0.037, 0.037]) {
      ell(headX + ex, headY - 0.005, 0.011, 0.011);
      fill(KEY.LINE);
      if (elder) {
        ell(headX + ex, headY - 0.005, 0.03, 0.025);
        stroke(1.8);
      }
    }
    x.beginPath();
    x.arc(X(headX), Y(headY - 0.035), L(0.028), 0.2 * Math.PI, 0.8 * Math.PI);
    stroke(2);
    if (h.bite) {
      const [hx, hy] = h.bite;
      p.line([hx + 0.01, hy + 0.015], [headX + 0.005, headY - 0.04]);
      ell(hx, hy, 0.034, 0.03);
      fill(KEY.SKIN);
      stroke(2);
    }
  } else if (side) {
    // ense saçı + yüz (sola bakar)
    x.save();
    ell(headX, headY, headR * 0.95, headR);
    x.clip();
    x.beginPath();
    x.ellipse(X(headX + 0.05), Y(headY + 0.03), L(headR * 0.85), L(headR * 0.98), 0, 0, Math.PI * 2);
    fill(KEY.HAIR);
    x.restore();
    ell(headX, headY, headR * 0.95, headR);
    stroke();
    // burun, göz, ağız
    x.beginPath();
    x.moveTo(X(headX - headR * 0.92), Y(headY + 0.01));
    x.lineTo(X(headX - headR * 0.92 - 0.025), Y(headY - 0.025));
    x.lineTo(X(headX - headR * 0.92 + 0.004), Y(headY - 0.035));
    x.fillStyle = KEY.SKIN;
    x.fill();
    stroke(2);
    ell(headX - 0.05, headY + 0.0, 0.011, 0.011);
    fill(KEY.LINE);
    if (elder) {
      ell(headX - 0.055, headY, 0.03, 0.025);
      stroke(1.8);
      p.line([headX - 0.025, headY + 0.005], [headX + 0.04, headY + 0.01], 1.6);
    }
    p.line([headX - 0.085, headY - 0.055], [headX - 0.055, headY - 0.055], 2);
  } else if (b34) {
    // yanağın ince dilimi solda
    x.save();
    ell(headX, headY, headR, headR);
    x.clip();
    x.beginPath();
    x.ellipse(X(headX - headR * 0.95), Y(headY - 0.02), L(0.04), L(headR * 0.7), 0, 0, Math.PI * 2);
    fill(KEY.SKIN);
    x.restore();
    ell(headX, headY, headR, headR);
    stroke();
  }
}

/** Uzun saç arkadan (sırta iner), topuz ve güneş şapkası — başın ÜSTÜNE çizilir. */
export function drawHairOver(p: Pen, h: HeadSpec) {
  const { sil, view, headX, headY, headR } = h;
  const side = view === 'side';
  if (sil === 'long' && (view === 'back' || view === 'back34')) {
    p.rr(headX, headY - 0.02, headR * 2 - 0.01, h.shoulderY - 0.13, 0.07);
    p.fill(KEY.HAIR);
    p.stroke();
  }
  if (sil === 'bun') {
    p.ell(headX + (side ? 0.06 : 0), headY + headR + 0.02, 0.05, 0.04);
    p.fill(KEY.HAIR);
    p.stroke();
  } else if (sil === 'sunhat') {
    // geniş kenar + kubbe: her açıdan görünen silüet
    p.ell(headX, headY + 0.06, side ? 0.17 : 0.18, 0.035);
    p.fill(KEY.HAIR);
    p.stroke();
    p.rr(headX, headY + 0.15, 0.15, headY + 0.065, 0.05);
    p.fill(KEY.HAIR);
    p.stroke();
  }
}
