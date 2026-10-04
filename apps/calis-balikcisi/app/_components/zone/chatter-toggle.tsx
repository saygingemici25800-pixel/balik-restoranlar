'use client';

import { useSyncExternalStore } from 'react';

import { chatterOn, setChatter, subscribeChatter } from '@/lib/zone/npc/chatter-pref';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Konuşma balonlarını aç/kapa (WCAG 2.2.2: kendi kendine güncellenen içerik durdurulabilir).
 * "Çık" düğmesinin altında, aynı görünüm. Yalnız gezinirken görünür: yükleyicide, açık panoda
 * ve kat geçişinde gizli (panonun "Geri" düğmesinin üstüne binmesin — joystick ile aynı kural).
 * Erişilebilir ad sabit ("Konuşmalar"), durum `aria-pressed` ile.
 */
export function ChatterToggle() {
  const on = useSyncExternalStore(subscribeChatter, chatterOn, () => true);
  const playing = useZoneStore((s) => s.state === 'zone');
  if (!playing) return null;
  return (
    <button
      type="button"
      aria-label="Konuşmalar"
      aria-pressed={on}
      onClick={() => setChatter(!on)}
      data-testid="zone-chatter"
      className="absolute right-4 top-16 z-[90] rounded-full border border-fg/70 bg-bg/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-fg backdrop-blur-sm transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:right-6 md:top-[4.5rem]"
    >
      Konuşmalar <span aria-hidden="true">{on ? 'açık' : 'kapalı'}</span>
    </button>
  );
}
