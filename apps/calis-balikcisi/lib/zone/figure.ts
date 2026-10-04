/**
 * Karakter çizimi ve açı → görünüm eşlemesi — **three.js'siz** (MANCH `capy.ts` karşılığı).
 *
 * Neden ayrı dosya: çizim ve eşleme three gerektirmez. three içeren `character.ts`'te
 * dursaydı, bunları statik import eden herhangi bir ana sayfa bileşeni three'yi de ana
 * sayfaya taşırdı (docs/zone-3d-modul.md bölüm 10, sızıntı dersi).
 *
 * Karakterler (kapıda seçilir): genel bir "balıkçı" — kasket, çizgili tişört — ya da etekli genç
 * bir kız (`figure-girl.ts`). Gerçek bir kişiyi temsil ETMEZLER (karar 2026-10-01: gerçek kişiler
 * karikatürleştirilmez). Sprite PNG'leri gelirse `character.ts` → `MASCOT_SPRITE_BASE` değişir,
 * bu çizim yedek olarak kalır.
 */
import type { BrandPalette } from '@/lib/zone/brand';
import { drawGirl } from '@/lib/zone/figure-girl';
import { ellipse, roundRect } from '@/lib/zone/figure-shapes';
import { SCENE_COLORS } from '@/lib/zone/frames';

export type CharView = 'back' | 'back34' | 'side' | 'front';
/** Kapıda seçilen karakter. */
export type HeroKind = 'erkek' | 'kiz';
export const HERO_KINDS: readonly HeroKind[] = ['erkek', 'kiz'];

export const CHAR_VIEWS: readonly CharView[] = ['back', 'back34', 'side', 'front'];

/* ------------------------------ açı → görünüm ------------------------------ */

/** |rel| 0 = sırtı dönük … π = yüzü bize dönük. 5 kova, 4 çizim (bölüm 6.1). */
const VIEW_BY_BUCKET: readonly CharView[] = ['back', 'back34', 'side', 'front', 'front'];

export function viewFor(rel: number): CharView {
  return VIEW_BY_BUCKET[Math.min(4, Math.round(Math.abs(rel) / (Math.PI / 4)))] ?? 'back';
}

/**
 * Sol taraf için ayrı çizim YOK — `scale.x = -1` ile aynalanır. `back` ve `front` simetrik
 * oldukları için aynalanmaz.
 */
export function mirrorFor(rel: number, view: CharView): boolean {
  return rel < 0 && view !== 'back' && view !== 'front';
}

/* ------------------------------ geçici sprite ------------------------------ */

type ViewShape = {
  /** Gövde genişliği (px, 220 genişlik ölçeğinde). */
  torsoW: number;
  /** Kafanın sola kayması — profil sola bakar. */
  lean: number;
};

const SHAPES: Record<CharView, ViewShape> = {
  back: { torsoW: 64, lean: 0 },
  back34: { torsoW: 56, lean: -7 },
  side: { torsoW: 44, lean: -12 },
  front: { torsoW: 64, lean: 0 },
};

/**
 * Line-art balıkçı: lacivert kontur (`--color-bg`), kum rengi çizgili tişört (`--color-fg`),
 * arduvaz pantolon (`--color-muted`). Dört görünümde de **aynı boy ve aynı zemin çizgisi**
 * — yoksa dönerken zıplar (bölüm 6.2). `back34` ve `side` **sola** bakar.
 */
export function drawFigure(
  x: CanvasRenderingContext2D,
  view: CharView,
  brand: BrandPalette,
  w: number,
  h: number,
  kind: HeroKind = 'erkek',
) {
  if (kind === 'kiz') {
    drawGirl(x, view, brand, w, h);
    return;
  }
  const s = w / 220;
  const cx = w / 2;
  const ground = h - 10 * s;
  const { torsoW, lean } = SHAPES[view];
  const side = view === 'side';
  const b34 = view === 'back34';
  const front = view === 'front';

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

  const shoulderY = ground - 192 * s;
  const hipY = ground - 112 * s;
  const footY = ground - 12 * s;
  const bodyX = cx + lean * 0.3 * s;

  /* ---- bacaklar + ayakkabı ---- */
  const legW = 22 * s;
  const legs = side ? [bodyX + 4 * s, bodyX - 6 * s] : [bodyX - 14 * s, bodyX + 14 * s];
  for (const lx of legs) {
    roundRect(x, lx - legW / 2, hipY - 4 * s, legW, footY - hipY + 4 * s, 6 * s);
    fill(brand.muted);
    stroke();
  }
  for (const lx of legs) {
    // ayakkabı: profilde burun sola, diğerlerinde ortalı
    const toe = side ? -9 * s : b34 ? -4 * s : 0;
    ellipse(x, lx + toe, ground - 6 * s, (side ? 17 : 13) * s, 7 * s);
    fill(brand.bg);
    stroke(3.5);
  }

  /* ---- gövde: çizgili tişört ---- */
  const torsoX = bodyX - (torsoW * s) / 2;
  const torsoH = hipY - shoulderY + 8 * s;
  roundRect(x, torsoX, shoulderY, torsoW * s, torsoH, 14 * s);
  fill(brand.fg);
  x.save();
  roundRect(x, torsoX, shoulderY, torsoW * s, torsoH, 14 * s);
  x.clip();
  x.strokeStyle = outline;
  x.lineWidth = 5 * s;
  for (let y = shoulderY + 14 * s; y < hipY + 8 * s; y += 13 * s) {
    x.beginPath();
    x.moveTo(torsoX - 4 * s, y);
    x.lineTo(torsoX + torsoW * s + 4 * s, y);
    x.stroke();
  }
  x.restore();
  roundRect(x, torsoX, shoulderY, torsoW * s, torsoH, 14 * s);
  stroke();

  /* ---- kollar: kısa kollu — üstte kol ağzı, altta ten ---- */
  const armW = 15 * s;
  const armTop = shoulderY + 6 * s;
  const armLen = 92 * s;
  const arms = side
    ? [bodyX + 2 * s]
    : b34
      ? [torsoX + 2 * s, torsoX + torsoW * s + armW / 2 + 1 * s]
      : [torsoX - armW / 2 + 1 * s, torsoX + torsoW * s + armW / 2 - 1 * s];
  for (const ax of arms) {
    roundRect(x, ax - armW / 2, armTop, armW, armLen, 7 * s);
    fill(SCENE_COLORS.skin);
    stroke();
    roundRect(x, ax - armW / 2 - 1 * s, armTop - 2 * s, armW + 2 * s, 30 * s, 7 * s);
    fill(brand.fg);
    stroke();
  }

  /* ---- boyun + kafa ---- */
  const hx = cx + lean * s;
  const hy = ground - 222 * s;
  const r = 26 * s;
  roundRect(x, bodyX + (lean * 0.5 - 7) * s, hy + 16 * s, 14 * s, shoulderY - hy - 12 * s, 4 * s);
  fill(SCENE_COLORS.skin);
  stroke(3.5);

  // kulaklar kafanın arkasında kalır — önce çizilir
  const ears: number[] = front ? [-r, r] : side ? [6 * s] : b34 ? [-r + 3 * s] : [-r, r];
  for (const ex of ears) {
    ellipse(x, hx + ex, hy + 2 * s, 6 * s, 9 * s);
    fill(SCENE_COLORS.skin);
    stroke(3.5);
  }

  ellipse(x, hx, hy, side ? r * 0.95 : r, r);
  fill(front || side ? SCENE_COLORS.skin : SCENE_COLORS.hair);
  stroke();

  if (side) {
    // ense saçı: kafanın sağ/arka yarısı
    x.save();
    ellipse(x, hx, hy, r * 0.95, r);
    x.clip();
    x.beginPath();
    x.ellipse(hx + 14 * s, hy - 8 * s, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
    fill(SCENE_COLORS.hair);
    x.restore();
    ellipse(x, hx, hy, r * 0.95, r);
    stroke();
    // kulak saçın üstünde görünür
    ellipse(x, hx + 6 * s, hy + 2 * s, 6 * s, 9 * s);
    fill(SCENE_COLORS.skin);
    stroke(3.5);
    // burun
    x.beginPath();
    x.moveTo(hx - r * 0.92, hy - 3 * s);
    x.lineTo(hx - r * 0.92 - 6 * s, hy + 6 * s);
    x.lineTo(hx - r * 0.92 + 1 * s, hy + 9 * s);
    x.fillStyle = SCENE_COLORS.skin;
    x.fill();
    stroke(3.5);
    // göz + ağız
    ellipse(x, hx - 12 * s, hy + 1 * s, 2.6 * s, 2.6 * s);
    fill(outline);
    x.beginPath();
    x.moveTo(hx - 19 * s, hy + 14 * s);
    x.lineTo(hx - 13 * s, hy + 14 * s);
    stroke(3);
  } else if (b34) {
    // yanağın ince bir dilimi solda görünür
    x.save();
    ellipse(x, hx, hy, r, r);
    x.clip();
    x.beginPath();
    x.ellipse(hx - r * 0.95, hy + 6 * s, 10 * s, r * 0.7, 0, 0, Math.PI * 2);
    fill(SCENE_COLORS.skin);
    x.restore();
    ellipse(x, hx, hy, r, r);
    stroke();
  } else if (front) {
    // perçem + yüz
    x.save();
    ellipse(x, hx, hy, r, r);
    x.clip();
    x.fillStyle = SCENE_COLORS.hair;
    x.fillRect(hx - r, hy - r, r * 2, 12 * s);
    x.restore();
    ellipse(x, hx, hy, r, r);
    stroke();
    for (const ex of [-9, 9]) {
      ellipse(x, hx + ex * s, hy + 2 * s, 2.6 * s, 2.6 * s);
      fill(outline);
    }
    x.beginPath();
    x.arc(hx, hy + 9 * s, 7 * s, 0.2 * Math.PI, 0.8 * Math.PI);
    stroke(3);
  }

  /* ---- kasket: her açıdan görünen imza ---- */
  ellipse(x, hx, hy - 19 * s, 29 * s, 12 * s);
  fill(brand.bg);
  stroke(3.5);
  if (front) {
    ellipse(x, hx, hy - 11 * s, 28 * s, 5 * s);
    fill(brand.muted);
    stroke(3);
  } else if (side) {
    ellipse(x, hx - 24 * s, hy - 12 * s, 15 * s, 4 * s);
    fill(brand.muted);
    stroke(3);
  } else if (b34) {
    ellipse(x, hx - 27 * s, hy - 13 * s, 7 * s, 3.5 * s);
    fill(brand.muted);
    stroke(3);
  }
}
