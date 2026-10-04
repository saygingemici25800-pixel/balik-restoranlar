/** Kahraman çizimlerinin ortak yolları (`figure.ts`, `figure-girl.ts`) — **three'siz**. */

export function roundRect(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

export function ellipse(x: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  x.beginPath();
  x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}
