import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Ana sayfa videolarının adresi — YALNIZ sunucu bileşenlerinde kullanılır (node:fs).
 *
 * Sorun: videolar `pub-…r2.dev` kovasında; Türk Telekom tüm `*.r2.dev`'i engelliyor (USOM
 * listesi), Türkiye'deki misafirlerin çoğu videoları göremiyor. Çözüm sırası:
 *  1. `public/media/<yol>` varsa sitenin kendi alan adından sunulur (Vercel CDN, her ağda açılır).
 *  2. Yoksa `NEXT_PUBLIC_MEDIA_BASE` (ör. R2 özel alan adı `https://media.calisbalikcisi.com`).
 *  3. Yoksa bugünkü r2.dev adresi (davranış değişmez).
 * Dosyalar `public/media/web/…` ve `public/media/ekip/…` altına konunca ayar gerekmeden geçer.
 */
const REMOTE = (process.env.NEXT_PUBLIC_MEDIA_BASE || 'https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev').replace(
  /\/$/,
  '',
);
const PUBLIC_DIR = join(process.cwd(), 'public');

export function mediaUrl(path: string): string {
  const clean = path.replace(/^\//, '');
  if (existsSync(join(PUBLIC_DIR, 'media', clean))) return `/media/${clean}`;
  return `${REMOTE}/${clean}`;
}
