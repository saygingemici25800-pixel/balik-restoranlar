/**
 * Kurgusal insanların silüetleri — saç, şapka ve etek seçimi (`body.ts` maske bitleri bu sırada).
 * Uzun saç ve topuz etekli; hasır şapkanın rengi saç kanalından.
 */
export const SILS = ['short', 'long', 'elder', 'sunhat', 'bun'] as const;
export type Sil = (typeof SILS)[number];
