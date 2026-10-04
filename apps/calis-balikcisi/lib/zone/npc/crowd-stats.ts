import type { Ambient } from './ambient';
import type { Crowd } from './roster';

/** Dev/QA: son kurulan kadronun özeti (`__ZONE_STATS__().npc`). Yalnız sayılar — kimlik yok. */
let last: {
  tier: string;
  diners: number;
  items: number;
  byStyle: Crowd['counts'];
  ambient: Ambient['counts'];
  towels: number;
  /** Konuşabilenlerin dil dağılımı (turist sayısı). */
  langs: Record<string, number>;
} | null = null;

export function setCrowdStats(c: Crowd, a: Ambient) {
  const langs: Record<string, number> = {};
  for (const p of [...c.diners, ...a.sitters, ...a.strollers]) langs[p.talk.lang] = (langs[p.talk.lang] ?? 0) + 1;
  last = {
    tier: c.tier,
    diners: c.diners.length,
    items: c.items.length,
    byStyle: c.counts,
    ambient: a.counts,
    towels: a.towels.length,
    langs,
  };
}

export const crowdStats = () => last;
