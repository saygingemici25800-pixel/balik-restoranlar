/**
 * Kapıda seçilebilen ikinci karakter: etekli genç bir kız — **three'siz**. Balıkçıyla aynı çizgi dili
 * (lacivert kontur, kum rengi üst), aynı boy ve aynı zemin çizgisi; dönerken zıplamasın diye dört
 * görünümde de ölçüler sabit. `back34` ve `side` SOLA bakar (sağ taraf aynalanır). İmzası kasket
 * yerine gün batımı turuncusu saç bandı ve etek. Gerçek bir kişiyi temsil ETMEZ.
 */
import type { BrandPalette } from '@/lib/zone/brand';
import type { CharView } from '@/lib/zone/figure';
import { ellipse, roundRect } from '@/lib/zone/figure-shapes';
import { SCENE_COLORS } from '@/lib/zone/frames';

const SHAPES: Record<CharView, { torsoW: number; lean: number }> = {
  back: { torsoW: 56, lean: 0 },
  back34: { torsoW: 50, lean: -7 },
  side: { torsoW: 38, lean: -12 },
  front: { torsoW: 56, lean: 0 },
};

export function drawGirl(x: CanvasRenderingContext2D, view: CharView, brand: BrandPalette, w: number, h: number) {
  const s = w / 220;
  const cx = w / 2;
  const ground = h - 10 * s;
  const { torsoW, lean } = SHAPES[view];
  const side = view === 'side';
  const b34 = view === 'back34';
  const front = view === 'front';
  const back = view === 'back';

  const outline = brand.bg;
  const stroke = (lw = 4.5) => {
    x.lineWidth = lw * s;
    x.strokeStyle = outline;
    x.stroke();
  };
  const fill = (color: string) => {
    x.fillStyle = color;
    x.fill();
  };

  x.clearRect(0, 0, w, h);
  x.lineJoin = 'round';
  x.lineCap = 'round';

  const shoulderY = ground - 190 * s;
  const waistY = ground - 120 * s;
  const hemY = ground - 64 * s;
  const bodyX = cx + lean * 0.3 * s;
  const torsoX = bodyX - (torsoW * s) / 2;
  const hx = cx + lean * s;
  const hy = ground - 222 * s;
  const r = 25 * s;

  /* ---- uzun saç, gövdenin ARKASINDA kalan kısım (önden ve profilden) ---- */
  if (front) {
    roundRect(x, hx - r - 7 * s, hy - 4 * s, 2 * r + 14 * s, shoulderY + 40 * s - (hy - 4 * s), 16 * s);
    fill(SCENE_COLORS.hair);
    stroke();
  } else if (side) {
    roundRect(x, hx - 2 * s, hy - 10 * s, r + 16 * s, shoulderY + 52 * s - (hy - 10 * s), 16 * s);
    fill(SCENE_COLORS.hair);
    stroke();
  }

  /* ---- bacaklar (ten) + ayakkabı ---- */
  const legW = 15 * s;
  const legs = side ? [bodyX + 3 * s, bodyX - 5 * s] : b34 ? [bodyX - 9 * s, bodyX + 11 * s] : [bodyX - 10 * s, bodyX + 10 * s];
  for (const lx of legs) {
    roundRect(x, lx - legW / 2, hemY - 8 * s, legW, ground - 8 * s - (hemY - 8 * s), 6 * s);
    fill(SCENE_COLORS.skin);
    stroke();
  }
  for (const lx of legs) {
    const toe = side ? -8 * s : b34 ? -3 * s : 0;
    ellipse(x, lx + toe, ground - 6 * s, (side ? 14 : 11) * s, 6 * s);
    fill(brand.bg);
    stroke(3.5);
  }

  /* ---- üst: kum rengi, önden yuvarlak yaka ---- */
  const topH = waistY - shoulderY + 2 * s;
  roundRect(x, torsoX, shoulderY, torsoW * s, topH, 14 * s);
  fill(brand.fg);
  stroke();
  if (front) {
    x.save();
    roundRect(x, torsoX, shoulderY, torsoW * s, topH, 14 * s);
    x.clip();
    ellipse(x, bodyX, shoulderY + 1 * s, 11 * s, 10 * s);
    fill(SCENE_COLORS.skin);
    x.restore();
    x.beginPath();
    x.ellipse(bodyX, shoulderY + 1 * s, 11 * s, 10 * s, 0, 0, Math.PI);
    stroke(3);
  }

  /* ---- etek: belden dizin üstüne, kloş ---- */
  const top = waistY - 6 * s;
  const [l0, r0, l1, r1] = side
    ? [-19, 19, -24, 30]
    : b34
      ? [-23, 23, -34, 38]
      : [-(torsoW / 2 - 2), torsoW / 2 - 2, -(torsoW / 2 + 15), torsoW / 2 + 15];
  const skirt = () => {
    x.beginPath();
    x.moveTo(bodyX + l0 * s, top);
    x.lineTo(bodyX + r0 * s, top);
    x.lineTo(bodyX + r1 * s, hemY - 5 * s);
    x.quadraticCurveTo(bodyX + ((l1 + r1) / 2) * s, hemY + 7 * s, bodyX + l1 * s, hemY - 5 * s);
    x.closePath();
  };
  skirt();
  fill(brand.accent);
  x.save();
  skirt();
  x.clip();
  // etek ucunda kum rengi şerit + iki pli
  x.beginPath();
  x.moveTo(bodyX + (l1 - 4) * s, hemY - 15 * s);
  x.quadraticCurveTo(bodyX + ((l1 + r1) / 2) * s, hemY - 3 * s, bodyX + (r1 + 4) * s, hemY - 15 * s);
  x.lineWidth = 5 * s;
  x.strokeStyle = brand.fg;
  x.stroke();
  if (!side) {
    for (const k of [-1, 1]) {
      x.beginPath();
      x.moveTo(bodyX + k * 8 * s, top + 8 * s);
      x.lineTo(bodyX + k * 13 * s, hemY - 18 * s);
      stroke(2.5);
    }
  }
  x.restore();
  skirt();
  stroke();

  /* ---- kollar: kısa kol ağzı + ten ---- */
  const armW = 13 * s;
  const armTop = shoulderY + 6 * s;
  const arms = side
    ? [bodyX + 2 * s]
    : b34
      ? [torsoX + 2 * s, torsoX + torsoW * s + armW / 2 + 1 * s]
      : [torsoX - armW / 2 + 1 * s, torsoX + torsoW * s + armW / 2 - 1 * s];
  for (const ax of arms) {
    roundRect(x, ax - armW / 2, armTop, armW, 86 * s, 7 * s);
    fill(SCENE_COLORS.skin);
    stroke();
    roundRect(x, ax - armW / 2 - 1 * s, armTop - 2 * s, armW + 2 * s, 22 * s, 7 * s);
    fill(brand.fg);
    stroke();
  }

  /* ---- boyun ---- */
  roundRect(x, bodyX + (lean * 0.5 - 6) * s, hy + 15 * s, 12 * s, shoulderY - hy - 11 * s, 4 * s);
  fill(SCENE_COLORS.skin);
  stroke(3.5);

  /* ---- kafa + saç ---- */
  if (back || b34) {
    // arkadan: saç kafayı ve sırtın üstünü örter (tek parça, yumuşak U uç)
    const bottom = shoulderY + 50 * s;
    const half = r + 4 * s;
    x.beginPath();
    x.moveTo(hx - half, bottom - 12 * s);
    x.lineTo(hx - half, hy);
    x.arc(hx, hy, half, Math.PI, 2 * Math.PI);
    x.lineTo(hx + half, bottom - 12 * s);
    x.quadraticCurveTo(hx, bottom + 6 * s, hx - half, bottom - 12 * s);
    x.closePath();
    fill(SCENE_COLORS.hair);
    stroke();
    for (const k of [-1, 1]) {
      x.beginPath();
      x.moveTo(hx + k * 6 * s, hy - r + 8 * s);
      x.quadraticCurveTo(hx + k * 11 * s, hy + 18 * s, hx + k * 8 * s, bottom - 6 * s);
      stroke(2);
    }
    if (b34) {
      // yanağın ince bir dilimi solda
      x.save();
      ellipse(x, hx, hy, r, r);
      x.clip();
      ellipse(x, hx - r * 0.98, hy + 7 * s, 9 * s, r * 0.62);
      fill(SCENE_COLORS.skin);
      stroke(3);
      x.restore();
    }
  } else if (side) {
    ellipse(x, hx, hy, r * 0.95, r);
    fill(SCENE_COLORS.skin);
    x.save();
    ellipse(x, hx, hy, r * 0.95, r);
    x.clip();
    ellipse(x, hx + 12 * s, hy - 8 * s, r * 0.9, r);
    fill(SCENE_COLORS.hair);
    ellipse(x, hx - 6 * s, hy - r * 0.72, r * 0.75, 9 * s);
    fill(SCENE_COLORS.hair);
    x.restore();
    ellipse(x, hx, hy, r * 0.95, r);
    stroke();
    // burun, göz + kirpik, gülümseme
    x.beginPath();
    x.moveTo(hx - r * 0.92, hy - 1 * s);
    x.lineTo(hx - r * 0.92 - 5 * s, hy + 7 * s);
    x.lineTo(hx - r * 0.92 + 1 * s, hy + 9 * s);
    fill(SCENE_COLORS.skin);
    stroke(3.5);
    ellipse(x, hx - 12 * s, hy + 2 * s, 2.6 * s, 2.6 * s);
    fill(outline);
    x.beginPath();
    x.moveTo(hx - 13 * s, hy - 1 * s);
    x.lineTo(hx - 17 * s, hy - 4 * s);
    stroke(2.5);
    x.beginPath();
    x.moveTo(hx - 19 * s, hy + 14 * s);
    x.quadraticCurveTo(hx - 16 * s, hy + 16 * s, hx - 12 * s, hy + 14 * s);
    stroke(3);
  } else {
    ellipse(x, hx, hy, r, r);
    fill(SCENE_COLORS.skin);
    x.save();
    ellipse(x, hx, hy, r, r);
    x.clip();
    // yandan ayrılmış perçem
    ellipse(x, hx + 4 * s, hy - r * 0.64, r * 1.1, r * 0.52);
    fill(SCENE_COLORS.hair);
    x.restore();
    ellipse(x, hx, hy, r, r);
    stroke();
    // omuzlara düşen iki tutam
    for (const lx of [hx - r - 6 * s, hx + r - 6 * s]) {
      roundRect(x, lx, hy - 8 * s, 12 * s, shoulderY + 34 * s - (hy - 8 * s), 6 * s);
      fill(SCENE_COLORS.hair);
      stroke(3.5);
    }
    for (const k of [-1, 1]) {
      ellipse(x, hx + k * 9 * s, hy + 3 * s, 3.1 * s, 3.3 * s);
      fill(outline);
    }
    x.save();
    x.globalAlpha = 0.35;
    for (const k of [-1, 1]) {
      ellipse(x, hx + k * 14 * s, hy + 10 * s, 4.5 * s, 3 * s);
      fill(brand.accent);
    }
    x.restore();
    x.beginPath();
    x.arc(hx, hy + 10 * s, 6 * s, 0.2 * Math.PI, 0.8 * Math.PI);
    stroke(3);
  }

  /* ---- saç bandı: her açıdan görünen imza (kontur + turuncu) ---- */
  const band = () => {
    x.beginPath();
    if (side) {
      x.moveTo(hx - 12 * s, hy - r + 4 * s);
      x.quadraticCurveTo(hx + 6 * s, hy - r - 5 * s, hx + 17 * s, hy + 1 * s);
    } else if (front) {
      x.ellipse(hx, hy - 3 * s, r + 1 * s, r - 3 * s, 0, 1.12 * Math.PI, 1.88 * Math.PI);
    } else {
      x.ellipse(hx + (b34 ? 2 : 0) * s, hy - 2 * s, r + 4 * s, r - 2 * s, 0, 1.08 * Math.PI, 1.92 * Math.PI);
    }
  };
  band();
  stroke(9);
  band();
  x.lineWidth = 5 * s;
  x.strokeStyle = brand.accent;
  x.stroke();
}
