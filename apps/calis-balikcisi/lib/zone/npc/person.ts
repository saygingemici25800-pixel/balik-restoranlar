/**
 * Kurgusal misafir çizimi: OTURAN — **three'siz** (figure.ts ile aynı kural: ana sayfaya sızamaz).
 *
 * Renk değil ANAHTAR çizilir; shader anahtarı örnek başına paletten boyar (`crowd-material`).
 * Anahtarlar doğrusal ayrışır: kenar yumuşatması ve mipmap karışımları doğru renge çözülür.
 * Baş, yüz ve saç ayakta duranlarla ortak (`pen.ts`).
 *
 * Kahramanla aynı görünüm kuralları (figure.ts): 4 görünüm, `back34` ve `side` SOLA bakar
 * (sağ taraf shader'da aynalanır), dört görünümde aynı zemin çizgisi. Kasket ve çizgili tişört
 * kahramanın imzası — hiçbir misafirde yok. Yüz herkes için aynı basitlikte: nokta göz, kısa
 * gülüş; ten rengi yalnızca boyadır, hiçbir özellik ona bağlanmaz.
 */
import type { CharView } from '@/lib/zone/figure';
import { drawHairBehind, drawHairOver, drawHead, KEY, makePen, type Pt, type Sil, SILS } from './pen';

/** Oturan silüetler: atlas satırları bu sırada. */
export const SEATED_SILS = SILS;
export type SeatedSil = Sil;

/** Atlas hücresi (px) ve dünyadaki karşılığı (m). Alt kenar = zemin. */
export const SEATED_CELL = { w: 128, h: 192 } as const;
export const SEATED_QUAD = { w: 0.93, h: 1.4 } as const;

/**
 * Oturan misafir: kalça sandalye oturağında (0.47 m), omuz 0.98, baş merkezi 1.12. Kare 0: eller
 * masada; kare 1: çatal ağızda (yemek yeme). `ox, oy` hücrenin sol üst köşesi.
 */
export function drawSeated(
  x: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  sil: SeatedSil,
  view: CharView,
  frame: 0 | 1,
) {
  const p = makePen(x, ox, oy, SEATED_CELL.w, SEATED_CELL.h, SEATED_QUAD.w);
  const { stroke, fill, rr, ell, limb } = p;
  const { SKIN, TOP, BOTTOM, LINE } = KEY;

  const side = view === 'side';
  const b34 = view === 'back34';
  const front = view === 'front';
  const eating = frame === 1;

  p.begin();

  const hipY = 0.47;
  const shoulderY = 0.98;
  const headY = 1.12;
  const headR = 0.105;
  const bodyX = side ? 0.05 : b34 ? 0.02 : 0;
  const headX = side ? 0.03 : b34 ? 0.0 : 0;
  const torsoW = side ? 0.22 : b34 ? 0.3 : 0.34;
  const head = { sil, view, headX, headY, headR, shoulderY };

  drawHairBehind(p, head);

  /* ---- bacaklar ---- */
  if (side) {
    // uyluk öne (sola) yatay, baldır aşağı, ayakkabı sola
    limb([bodyX + 0.02, 0.5], [-0.3, 0.5], 0.12, BOTTOM);
    limb([-0.32, 0.5], [-0.32, 0.09], 0.1, BOTTOM);
    ell(-0.37, 0.045, 0.075, 0.035);
    fill(LINE);
  } else if (front || b34) {
    const k = b34 ? -0.05 : 0;
    rr(bodyX + k, 0.55, front ? 0.3 : 0.27, 0.44, 0.05);
    fill(BOTTOM);
    stroke();
    for (const lx of [-0.075, 0.075]) {
      limb([bodyX + k + lx, 0.46], [bodyX + k + lx, 0.08], 0.085, BOTTOM);
      ell(bodyX + k + lx, 0.04, 0.055, 0.032);
      fill(LINE);
    }
  } else {
    // arkadan: oturak altında yalnız baldırlar
    for (const lx of [-0.07, 0.07]) {
      limb([lx, 0.44], [lx, 0.08], 0.08, BOTTOM);
      ell(lx, 0.04, 0.05, 0.03);
      fill(LINE);
    }
  }

  /* ---- arka kol (profilde gövdenin arkasında kalan) ---- */
  if (side) {
    limb([bodyX + 0.04, 0.93], [bodyX + 0.05, 0.76], 0.075, TOP);
  }

  /* ---- gövde + boyun ---- */
  rr(bodyX, shoulderY, torsoW, hipY - 0.03, 0.06);
  fill(TOP);
  stroke();
  rr(headX + (side ? 0.01 : 0), headY - 0.06, 0.07, shoulderY - 0.01, 0.02);
  fill(SKIN);
  stroke(2);

  /* ---- kollar ---- */
  let bite: Pt | null = null;
  const shoulderL = bodyX - torsoW / 2 + 0.03;
  const shoulderR = bodyX + torsoW / 2 - 0.03;
  if (side) {
    // ön kol: dirsek aşağıda, el masanın kenarında (kare 0) ya da ağızda (kare 1)
    const elbow: Pt = [bodyX - 0.03, 0.77];
    const hand: Pt = eating ? [headX - 0.1, 1.04] : [-0.16, 0.79];
    limb([bodyX - 0.01, 0.94], elbow, 0.085, TOP);
    limb(elbow, hand, 0.07, SKIN);
    ell(hand[0], hand[1], 0.035, 0.03);
    fill(SKIN);
    stroke(2);
    if (eating) p.line([hand[0] - 0.02, hand[1] + 0.01], [hand[0] - 0.09, hand[1] + 0.03]);
  } else if (front) {
    for (const [sx, right] of [
      [shoulderL, false],
      [shoulderR, true],
    ] as const) {
      const elbow: Pt = [sx + (right ? 0.04 : -0.04), 0.74];
      const raise = eating && !right;
      const hand: Pt = raise ? [headX - 0.03, 1.05] : [sx + (right ? -0.05 : 0.05), 0.77];
      limb([sx, 0.94], elbow, 0.08, TOP);
      limb(elbow, hand, 0.065, SKIN);
      if (raise) {
        bite = hand;
        continue;
      }
      ell(hand[0], hand[1], 0.034, 0.03);
      fill(SKIN);
      stroke(2);
    }
  } else {
    // arkadan / 3/4 arkadan: üst kollar gövde yanlarında; yerken bir dirsek kalkar
    for (const [sx, right] of [
      [shoulderL, false],
      [shoulderR, true],
    ] as const) {
      const lift = eating && !right;
      const elbow: Pt = lift ? [sx - 0.1, 0.86] : [sx + (right ? 0.03 : -0.03), 0.74];
      limb([sx, 0.94], elbow, 0.08, TOP);
      if (b34 && !right) {
        // 3/4'te sol ön kol masaya uzanır
        const hand: Pt = lift ? [sx - 0.02, 1.0] : [sx - 0.08, 0.78];
        limb(elbow, hand, 0.065, SKIN);
      }
    }
  }

  drawHead(p, { ...head, bite });
  drawHairOver(p, head);
  p.end();
}
