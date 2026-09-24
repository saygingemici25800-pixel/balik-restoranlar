// Poster public/menu/<slug>.webp, video R2 public bucket'tan <slug>.mp4 olarak gelir.
export const R2_MENU_BASE =
  'https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev/menu';

export function posterUrl(slug: string): string {
  return `/menu/${slug}.webp`;
}

export function videoUrl(slug: string): string {
  return `${R2_MENU_BASE}/${slug}.mp4`;
}
