'use client';

import { useMemo } from 'react';

import { buildAmbient } from '@/lib/zone/npc/ambient';
import type { Speaker } from '@/lib/zone/npc/bubble-director';
import { setCrowdStats } from '@/lib/zone/npc/crowd-stats';
import { buildCrowd, pickCrowdTier } from '@/lib/zone/npc/roster';
import { BeachTowels } from './beach-towels';
import { ChatBubbles } from './chat-bubbles';
import { Diners } from './diners';
import { Strollers } from './strollers';
import { TableSettings } from './table-settings';

/**
 * Kalabalık katmanı: tohumlu kadro bir kez kurulur (cihaz kademesine göre). Masadakiler ve
 * kumda havluda oturanlar aynı oturan çizimde (tek çağrı); sahil yolu, kumsal ve yanlarda ayakta
 * duran/yürüyenler ayrı bir çağrıda. Arada biri kendi kendine tek satır söyler (balon; karşılıklı
 * sohbet yok). `?npc=off|low|high` elle seçer (A/B ölçümü).
 */
export function Crowd({ reduced }: { reduced: boolean }) {
  const { crowd, ambient, seated, speakers } = useMemo(() => {
    const tier = pickCrowdTier();
    const c = buildCrowd(tier);
    const a = buildAmbient(tier);
    setCrowdStats(c, a);
    const diners = [...c.diners, ...a.sitters];
    // konuşabilenler: oturan herkes + ayakta/yürüyenler (yürüyenin konumu canlı nesneden okunur)
    const list: Speaker[] = [...diners, ...a.strollers].map((p) => ({ talk: p.talk, ref: p }));
    return { crowd: c, ambient: a, seated: { ...c, diners }, speakers: list };
  }, []);
  if (crowd.tier === 'off') return null;
  return (
    <group name="zone-crowd">
      <TableSettings crowd={crowd} />
      <Diners crowd={seated} reduced={reduced} />
      <BeachTowels towels={ambient.towels} />
      <Strollers ambient={ambient} reduced={reduced} shadows={crowd.tier === 'high'} />
      <ChatBubbles speakers={speakers} slots={crowd.tier === 'high' ? 3 : 2} reduced={reduced} />
    </group>
  );
}
