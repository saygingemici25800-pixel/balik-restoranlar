/**
 * 4 açılık sprite seti (docs/zone-3d-modul.md bölüm 6).
 *
 * İki kaynak, TEK arayüz:
 *   1. `drawFigure()` — koddan çizilen sprite (şu an tek kaynak)
 *   2. `TextureLoader` — `MASCOT_SPRITE_BASE` dolarsa 4 PNG
 *
 * `createCharacterSet()` her zaman önce çizilmiş sprite'ı **senkron** döndürür, PNG'ler varsa
 * **dördü birden** yüklenince alanları yerinde değiştirir (yarım set dönerken zıplar).
 */
import * as THREE from 'three';

import { readBrand } from '@/lib/zone/brand';
import { CHAR_VIEWS, drawFigure, type CharView, type HeroKind } from '@/lib/zone/figure';
import { trackTexture } from '@/lib/zone/textures';

/**
 * PNG çizimleri gelince burası `"/images/zone"` gibi bir yol olur; şu an dosya YOK.
 * **Otomatik yoklama bilerek yok:** olmayan PNG'ye istek 404 üretir ve her açılışta 4 boş
 * istek demek olur. Dev'de `?sprites=<yol>` ile aynı yükleyici denenebilir.
 * Dosya adı: `<yol>/balikci-{back,back34,side,front}.png`, şeffaf, dördü aynı boy ve zemin çizgisi,
 * `back34` ve `side` sola bakar.
 */
export const MASCOT_SPRITE_BASE: string | null = null;

function resolveSpriteBase(): string | null {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('sprites');
    if (q) return q.replace(/\/$/, '');
  }
  return MASCOT_SPRITE_BASE;
}

export type CharacterSet = Record<CharView, THREE.Texture> & {
  /** QA/lab okur: çizim mi, gerçek PNG mi ekranda. */
  source: 'drawn' | 'png';
  dispose: () => void;
};

const SPRITE_W = 220;
const SPRITE_H = 280;

function drawnTexture(view: CharView, anisotropy: number, kind: HeroKind) {
  const c = document.createElement('canvas');
  c.width = SPRITE_W;
  c.height = SPRITE_H;
  const x = c.getContext('2d');
  if (x) drawFigure(x, view, readBrand(), SPRITE_W, SPRITE_H, kind);
  const t = trackTexture(new THREE.CanvasTexture(c), 'sprite');
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

export function createCharacterSet(anisotropy = 4, kind: HeroKind = 'erkek'): CharacterSet {
  const set: CharacterSet = {
    back: drawnTexture('back', anisotropy, kind),
    back34: drawnTexture('back34', anisotropy, kind),
    side: drawnTexture('side', anisotropy, kind),
    front: drawnTexture('front', anisotropy, kind),
    source: 'drawn',
    dispose: () => {},
  };

  let disposed = false;
  set.dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const v of CHAR_VIEWS) set[v].dispose();
  };

  // PNG çizimleri yalnız balıkçı için (dosya adı `balikci-*`)
  const root = kind === 'erkek' ? resolveSpriteBase() : null;
  if (root) {
    const loader = new THREE.TextureLoader();
    const all = CHAR_VIEWS.map(
      (v) =>
        new Promise<[CharView, THREE.Texture]>((resolve, reject) => {
          loader.load(`${root}/balikci-${v}.png`, (t) => resolve([v, t]), undefined, reject);
        }),
    );
    void Promise.all(all)
      .then((loaded) => {
        if (disposed) {
          // sahne bu arada kapandı — yeni dokular da bırakılır, yoksa sızıntı olur
          for (const [, t] of loaded) trackTexture(t, 'sprite').dispose();
          return;
        }
        for (const [v, t] of loaded) {
          trackTexture(t, 'sprite');
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = anisotropy;
          set[v].dispose(); // çizilmiş yedek gider
          set[v] = t;
        }
        set.source = 'png';
      })
      // isteğe bağlı varlık — gelmezse sessizce çizilmiş sprite'ta kalınır
      .catch(() => {});
  }

  return set;
}

/* ---------------------------- tekil set yönetimi ---------------------------- */

/**
 * Bileşen her karede `acquireCharacterSet` çağırır; anizotropi ve karakter değişmedikçe aynı set
 * döner. Mutasyon bu modülün içinde kalır.
 */
let current: { anisotropy: number; kind: HeroKind; set: CharacterSet } | null = null;

export function acquireCharacterSet(anisotropy: number, kind: HeroKind): CharacterSet {
  if (current && current.anisotropy === anisotropy && current.kind === kind) return current.set;
  current?.set.dispose();
  current = { anisotropy, kind, set: createCharacterSet(anisotropy, kind) };
  return current.set;
}

/** Sahne kapanınca set bırakılır (bölüm 11). */
export function releaseCharacterSet() {
  current?.set.dispose();
  current = null;
}
