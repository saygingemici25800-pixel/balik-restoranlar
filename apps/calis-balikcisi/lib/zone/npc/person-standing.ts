/**
 * Kurgusal misafir çizimi: AYAKTA ve YÜRÜYEN — **three'siz**. Sahil yolunda yürüyenler, kıyıda
 * gün batımını izleyenler, binanın yanlarında duranlar.
 *
 * Kareler: 0 duruş · 1–2 yürüyüş (adım/geçiş) · 3 telefonla fotoğraf (gün batımı). Baş, yüz ve
 * saç oturanlarla ortak (`pen.ts`); aynı anahtar renkler, aynı görünüm kuralları (`back34` ve
 * `side` SOLA bakar). Çocuk aynı çizimin ölçeklisi (örnek başına ölçek).
 */
import type { CharView } from '@/lib/zone/figure';
import { drawHairBehind, drawHairOver, drawHead, KEY, makePen, type Pt, type Sil } from './pen';

export const STANDING_CELL = { w: 96, h: 192 } as const;
export const STANDING_QUAD = { w: 0.93, h: 1.86 } as const;
export const STANDING_FRAMES = 4;
export type StandingFrame = 0 | 1 | 2 | 3;

export function drawStanding(
  x: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  sil: Sil,
  view: CharView,
  frame: StandingFrame,
) {
  const p = makePen(x, ox, oy, STANDING_CELL.w, STANDING_CELL.h, STANDING_QUAD.w);
  const { stroke, fill, rr, ell, limb } = p;
  const { SKIN, TOP, BOTTOM, LINE } = KEY;

  const side = view === 'side';
  const b34 = view === 'back34';
  const front = view === 'front';
  const back = view === 'back';
  const walkA = frame === 1;
  const walkB = frame === 2;
  const phone = frame === 3;

  p.begin();

  const hipY = 0.9;
  const shoulderY = 1.4;
  const headY = 1.53;
  const headR = 0.105;
  const bodyX = side ? 0.03 : b34 ? 0.02 : 0;
  const headX = side ? 0.0 : 0;
  const torsoW = side ? 0.22 : b34 ? 0.3 : 0.34;
  const head = { sil, view, headX, headY, headR, shoulderY };

  const arm = (shoulder: Pt, elbow: Pt, hand: Pt) => {
    limb(shoulder, elbow, 0.075, TOP);
    limb(elbow, hand, 0.062, SKIN);
    ell(hand[0], hand[1], 0.032, 0.03);
    fill(SKIN);
    stroke(2);
  };
  const leg = (hip: Pt, knee: Pt, ankle: Pt, toe: number) => {
    limb(hip, knee, 0.1, BOTTOM);
    limb(knee, ankle, 0.09, BOTTOM);
    ell(ankle[0] + toe, ankle[1] - 0.03, 0.065, 0.034);
    fill(LINE);
  };

  drawHairBehind(p, head);

  if (side) {
    /* ---- profil (sola yürür) ---- */
    const sh: Pt = [bodyX, shoulderY - 0.04];
    const hip: Pt = [bodyX, hipY];
    // uzak kol gövdenin arkasında: yürürken bacağın tersine sallanır
    if (walkA) arm(sh, [bodyX - 0.06, 1.13], [-0.13, 0.96]);
    else if (walkB) arm(sh, [bodyX + 0.01, 1.12], [0.02, 0.9]);
    if (walkA) {
      leg(hip, [bodyX + 0.1, 0.5], [0.19, 0.1], -0.02);
      leg(hip, [-0.07, 0.5], [-0.16, 0.08], -0.05);
    } else if (walkB) {
      leg(hip, [bodyX - 0.08, 0.52], [0.03, 0.17], -0.04);
      leg(hip, [bodyX + 0.01, 0.5], [bodyX - 0.01, 0.08], -0.05);
    } else {
      leg(hip, [bodyX + 0.02, 0.5], [bodyX + 0.01, 0.08], -0.05);
    }
    rr(bodyX, shoulderY, torsoW, hipY - 0.04, 0.06);
    fill(TOP);
    stroke();
    rr(headX + 0.01, headY - 0.06, 0.07, shoulderY - 0.01, 0.02);
    fill(SKIN);
    stroke(2);
    // yakın kol
    if (phone) {
      arm(sh, [-0.14, 1.36], [-0.27, 1.5]);
      rr(-0.31, 1.6, 0.03, 1.46, 0.01);
      fill(LINE);
    } else if (walkA) arm(sh, [bodyX + 0.08, 1.13], [0.17, 0.97]);
    else if (walkB) arm(sh, [bodyX - 0.02, 1.12], [-0.03, 0.9]);
    else arm(sh, [bodyX + 0.01, 1.12], [bodyX + 0.0, 0.88]);
  } else {
    /* ---- önden / arkadan / 3/4 arkadan ---- */
    const k = b34 ? -0.03 : 0;
    const hipL: Pt = [bodyX + k - 0.075, hipY];
    const hipR: Pt = [bodyX + k + 0.075, hipY];
    // yürürken bir ayak kalkar (adım), diğeri yerde; kare 1 ve 2 aynalı
    const liftL = walkA ? 0.07 : 0;
    const liftR = walkB ? 0.07 : 0;
    leg(hipL, [hipL[0] - 0.005, 0.5 + liftL], [hipL[0], 0.08 + liftL], 0);
    leg(hipR, [hipR[0] + 0.005, 0.5 + liftR], [hipR[0], 0.08 + liftR], 0);

    rr(bodyX, shoulderY, torsoW, hipY - 0.04, 0.06);
    fill(TOP);
    stroke();
    rr(headX, headY - 0.06, 0.07, shoulderY - 0.01, 0.02);
    fill(SKIN);
    stroke(2);

    const sL: Pt = [bodyX - torsoW / 2 + 0.035, shoulderY - 0.04];
    const sR: Pt = [bodyX + torsoW / 2 - 0.035, shoulderY - 0.04];
    if (phone) {
      // iki elle telefon: önden yüzün önünde, arkadan başın üstünde görünür
      const hy = front ? 1.47 : 1.62;
      arm(sL, [sL[0] - 0.08, 1.3], [headX - 0.04, hy]);
      arm(sR, [sR[0] + 0.08, 1.3], [headX + 0.04, hy]);
    } else {
      // kollar yanlarda; yürürken karşı kol öne/yukarı sallanır (önden derinlik görünmez: yükseklik)
      const swingL = walkB ? 0.05 : 0;
      const swingR = walkA ? 0.05 : 0;
      arm(sL, [sL[0] - 0.045, 1.13 + swingL], [sL[0] - 0.035, 0.88 + swingL * 1.6]);
      arm(sR, [sR[0] + 0.045, 1.13 + swingR], [sR[0] + 0.035, 0.88 + swingR * 1.6]);
    }
  }

  drawHead(p, head);
  drawHairOver(p, head);

  if (phone && !side) {
    // telefon: önden yüzün önünde, arkadan/3/4'ten başın üstünde (gün batımını çekiyor)
    const py = front ? 1.53 : 1.7;
    rr(headX + (b34 ? -0.02 : 0), py + 0.06, 0.075, py - 0.05, 0.012);
    fill(LINE);
    if (back || b34) stroke(1.5);
  }

  p.end();
}
