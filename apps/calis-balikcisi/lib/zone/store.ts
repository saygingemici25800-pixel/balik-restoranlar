import { create } from 'zustand';

import type { HeroKind } from '@/lib/zone/figure';
import type { FrameId, PortalId } from '@/lib/zone/frames';

/**
 * Zone durum makinesi (docs/zone-3d-modul.md bölüm 3).
 *
 *   closed → loading → zone ⇄ pov
 *                        ⇄ travel   (merdiven: kararma + diğer kata geçiş)
 *                        └──→ closed  (ÇIKIŞ / Esc)
 *
 * Karakter seçimi ayrı bir durum değil: `loading` sırasında yükleyici "Erkek / Kız" sorar; sahne
 * arkada kurulmaya devam eder. Sahne hazır VE seçim yapılmış olunca `zone`'a geçilir.
 * Kare başına değişen hiçbir şey burada değil — o `lib/zone/runtime.ts`'te.
 *
 * `three` import ETMEZ: kapı bileşeni (ana sayfa) bunu statik import edebilir.
 */
export type ZoneState = 'closed' | 'loading' | 'zone' | 'pov' | 'travel';

type ZoneStore = {
  state: ZoneState;
  /** Yakınlıktaki pano — prompt ve halka parlaması buna bakar. */
  nearFrame: FrameId | null;
  /** Yakınlıktaki merdiven geçidi (pano ile aynı anda dolu olmaz — en yakını kazanır). */
  nearPortal: PortalId | null;
  /** `travel` durumunda kullanılan geçit. */
  travelling: PortalId | null;
  /** POV'da açık olan pano. */
  pov: FrameId | null;
  /** Yükleyici yüzdesi (0–100). */
  progress: number;
  /** Gezen karakter (kurgusal, gerçek kişi değil). */
  hero: HeroKind;
  /** Bu açılışta karakter seçildi mi? */
  chosen: boolean;
  /** Sahne kuruldu ama seçim bekleniyor. */
  sceneReady: boolean;
  /** POV kapanınca odağın döneceği pano (bölüm 12). */
  returnFocus: FrameId | null;

  /** Kapı düğmesi: doğrudan yüklemeye geçer. */
  enter: () => void;
  setProgress: (progress: number) => void;
  /** Sahne GERÇEKTEN kurulunca çağrılır; seçim yapılmadıysa yükleyici seçimi bekler. */
  ready: () => void;
  /** Yükleyicideki karakter seçimi; sahne hazırsa Zone başlar. */
  choose: (hero: HeroKind) => void;
  /** Yakınlığı tek seferde yazar; değişmediyse set etmez (gereksiz render yok). */
  setNear: (frame: FrameId | null, portal: PortalId | null) => void;
  /** Merdiven: kararma başlar, `LevelTransition` karakteri diğer kata taşır. */
  startTravel: (id: PortalId) => void;
  finishTravel: () => void;
  openFrame: (id: FrameId) => void;
  clearReturnFocus: () => void;
  /** POV'dan çıkış — kamera açısına DOKUNMAZ (bölüm 5.3). */
  closeFrame: () => void;
  exit: () => void;
};

export const useZoneStore = create<ZoneStore>((set, get) => ({
  state: 'closed',
  nearFrame: null,
  nearPortal: null,
  travelling: null,
  pov: null,
  progress: 0,
  returnFocus: null,
  hero: 'erkek',
  chosen: false,
  sceneReady: false,

  enter: () =>
    set({
      state: 'loading',
      progress: 0,
      nearFrame: null,
      nearPortal: null,
      travelling: null,
      pov: null,
      returnFocus: null,
      chosen: false,
      sceneReady: false,
    }),

  setProgress: (progress) => set({ progress: Math.max(0, Math.min(100, progress)) }),

  ready: () => {
    if (get().state !== 'loading') return;
    if (get().chosen) set({ state: 'zone', progress: 100 });
    else set({ sceneReady: true, progress: 100 });
  },

  choose: (hero) => {
    if (get().state !== 'loading') return;
    if (get().sceneReady) set({ hero, chosen: true, state: 'zone' });
    else set({ hero, chosen: true });
  },

  setNear: (nearFrame, nearPortal) => {
    const cur = get();
    if (cur.nearFrame !== nearFrame || cur.nearPortal !== nearPortal) set({ nearFrame, nearPortal });
  },

  startTravel: (travelling) => set({ state: 'travel', travelling, nearFrame: null, nearPortal: null }),

  finishTravel: () => set({ state: 'zone', travelling: null }),

  openFrame: (pov) => set({ state: 'pov', pov, returnFocus: pov }),

  clearReturnFocus: () => set({ returnFocus: null }),

  closeFrame: () => set({ state: 'zone', pov: null }),

  exit: () =>
    set({
      state: 'closed',
      pov: null,
      nearFrame: null,
      nearPortal: null,
      travelling: null,
      progress: 0,
      returnFocus: null,
      chosen: false,
      sceneReady: false,
    }),
}));

// Dev/QA: testler store'a buradan erişir (prod'da tree-shake edilir).
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as Record<string, unknown>).__ZONE__ = useZoneStore;
}
