/**
 * Konuşma balonu düzeni ve çizimi — **three'siz**. Kum renkli balon, lacivert kontur ve yazı
 * (marka renkleri, ~15:1 kontrast), altta konuşana inen kuyruk.
 *
 * Düzen ölçülerek kurulur (`layoutBubble`): yönetmen balonu yerleştirmeden önce gerçek ekran
 * kutusunu bilir — kenardan taşma, HUD'a ve diğer balonlara binme ölçüyle önlenir. İki satırda
 * dengeli bölünür (ikinci satırda tek kelime kalmasın); dar ekranda üç satıra kadar.
 */
import type { BrandPalette } from '@/lib/zone/brand';

export const BUBBLE_CANVAS = { w: 512, h: 160 } as const;
const PAD_X = 20;
const PAD_Y = 12;
const TAIL = 16;
const EDGE = 3;
/** Kanvasta yazı için en geniş alan: masaüstü / dar ekran (px). */
export const TEXT_W = { wide: BUBBLE_CANVAS.w - 2 * PAD_X - 16, narrow: 300 } as const;

/**
 * Kalam'da Kiril yok: genel `cursive` yerine sistemin sans-serif'ine düşsün (serif değil).
 * Yalnız balon için; sitenin font ayarına dokunulmaz.
 */
export const bubbleFont = (brand: BrandPalette, px: number) =>
  `700 ${px}px ${brand.bodyFont.replace(/,?\s*cursive\s*$/i, '')}, system-ui, sans-serif`;

export type BubbleLayout = {
  readonly text: string;
  readonly lines: readonly string[];
  readonly px: number;
  /** Balon gövdesinin genişliği ve kuyruk dahil yüksekliği (kanvas px). */
  readonly bw: number;
  readonly bh: number;
};

function greedy(x: CanvasRenderingContext2D, words: readonly string[], maxW: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (x.measureText(next).width <= maxW || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** İki satıra sığıyorsa en dengeli bölme (genişin genişliği en küçük). */
function balanced(x: CanvasRenderingContext2D, words: readonly string[], maxW: number): string[] | null {
  let best: string[] | null = null;
  let bestW = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const w = Math.max(x.measureText(a).width, x.measureText(b).width);
    if (w <= maxW && w < bestW) {
      bestW = w;
      best = [a, b];
    }
  }
  return best;
}

export function layoutBubble(x: CanvasRenderingContext2D, text: string, brand: BrandPalette, maxW: number): BubbleLayout {
  const words = text.split(/\s+/);
  let px = 30;
  let lines: string[] = [];
  for (; px >= 20; px -= 2) {
    x.font = bubbleFont(brand, px);
    if (x.measureText(text).width <= maxW) {
      lines = [text];
      break;
    }
    const two = balanced(x, words, maxW);
    if (two) {
      lines = two;
      break;
    }
    lines = greedy(x, words, maxW);
    if (lines.length <= 3) break;
  }
  const textW = Math.max(...lines.map((l) => x.measureText(l).width));
  const bw = Math.min(BUBBLE_CANVAS.w - 6, textW + 2 * PAD_X);
  const bh = lines.length * px * 1.12 + 2 * PAD_Y + TAIL + EDGE;
  return { text, lines, px, bw, bh: Math.min(bh, BUBBLE_CANVAS.h - 2) };
}

/** Balonu kanvasın ortasına, alt kenarda kuyruk ucuyla çizer. */
export function drawBubble(x: CanvasRenderingContext2D, l: BubbleLayout, brand: BrandPalette) {
  const { w: W, h: H } = BUBBLE_CANVAS;
  x.clearRect(0, 0, W, H);
  x.font = bubbleFont(brand, l.px);
  const lh = l.px * 1.12;
  const body = l.bh - TAIL - EDGE;
  const bx = (W - l.bw) / 2;
  const by = H - TAIL - body - EDGE;
  const r = Math.min(18, body / 2);

  x.lineJoin = 'round';
  x.beginPath();
  x.moveTo(bx + r, by);
  x.arcTo(bx + l.bw, by, bx + l.bw, by + body, r);
  x.arcTo(bx + l.bw, by + body, bx, by + body, r);
  // kuyruk: alt kenarın ortasından konuşana
  x.lineTo(W / 2 + 12, by + body);
  x.lineTo(W / 2, H - EDGE);
  x.lineTo(W / 2 - 12, by + body);
  x.arcTo(bx, by + body, bx, by, r);
  x.arcTo(bx, by, bx + l.bw, by, r);
  x.closePath();
  x.fillStyle = brand.fg;
  x.fill();
  x.lineWidth = 4;
  x.strokeStyle = brand.bg;
  x.stroke();

  x.fillStyle = brand.bg;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  l.lines.forEach((line, i) => x.fillText(line, W / 2, by + PAD_Y + lh * (i + 0.5)));
}
