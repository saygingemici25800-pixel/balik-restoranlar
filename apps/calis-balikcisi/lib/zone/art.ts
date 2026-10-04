/**
 * Pano görselleri (docs/zone-3d-modul.md bölüm 7.3). MANCH `art.ts` kalıbı: **önce yer tutucu,
 * sonra gerçek görsel.** Sahne beklemez; `TextureLoader` bitince doku yerinde değişir, pano kodu
 * bunu bilmez. Görsel yüklenemezse yer tutucu kalır (kırık görsel yok).
 *
 * Farklar: fotoğraflar pano yüzüne "cover" kırpılır (dikey 3:4 ve 9:16 fotoğraflar bozulmaz);
 * görseli olmayan pano (iletişim) dokusunu koddan çizer ve font gelince yeniden çizilir.
 */
import * as THREE from 'three';

import type { BrandPalette } from '@/lib/zone/brand';
import { CONTACT_CARD_LINES } from '@/lib/zone/board-content';
import { ART_H, ART_W, type FrameId, type ZoneFrame } from '@/lib/zone/frames';
import { artPlaceholderTexture, contactCardTexture, trackTexture } from '@/lib/zone/textures';

export type ArtTexture = {
  texture: THREE.Texture;
  source: 'placeholder' | 'image' | 'drawn';
};

const PLANE_ASPECT = ART_W / ART_H;

/** Görseli pano yüzünü dolduracak şekilde ortadan kırpar (CSS `object-fit: cover`). */
function coverCrop(t: THREE.Texture) {
  const img = t.image as { width?: number; height?: number } | undefined;
  if (!img?.width || !img.height) return;
  const a = img.width / img.height;
  if (a < PLANE_ASPECT) {
    const r = a / PLANE_ASPECT;
    t.repeat.set(1, r);
    t.offset.set(0, (1 - r) / 2);
  } else {
    const r = PLANE_ASPECT / a;
    t.repeat.set(r, 1);
    t.offset.set((1 - r) / 2, 0);
  }
}

const arts = new Map<FrameId, { key: string; art: ArtTexture; dispose: () => void }>();

/**
 * Bir panonun görselini verir. Aynı `id` + aynı anahtar için hep aynı nesne döner (her karede
 * çağrılması güvenli — idempotent). Anahtar marka/font değişince değişir: yazılı doku yeniden çizilir.
 */
export function acquireArt(
  frame: ZoneFrame,
  brand: BrandPalette,
  fontEpoch: number,
  anisotropy: number,
): ArtTexture {
  const key = `${frame.art ?? 'drawn'}|${fontEpoch}|${brand.bg}|${brand.fg}|${brand.accent}|${anisotropy}`;
  const current = arts.get(frame.id);
  if (current && current.key === key) return current.art;
  current?.dispose();

  if (!frame.art) {
    const art: ArtTexture = { texture: contactCardTexture(brand, CONTACT_CARD_LINES, fontEpoch), source: 'drawn' };
    art.texture.anisotropy = anisotropy;
    arts.set(frame.id, { key, art, dispose: () => art.texture.dispose() });
    return art;
  }

  const art: ArtTexture = {
    texture: artPlaceholderTexture(brand, frame.title, frame.kicker),
    source: 'placeholder',
  };
  let disposed = false;
  arts.set(frame.id, {
    key,
    art,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      art.texture.dispose();
    },
  });

  new THREE.TextureLoader().load(
    frame.art,
    (t) => {
      // Sahne bu arada kapandıysa yeni doku da bırakılır, yoksa sızıntı olur.
      if (disposed) {
        trackTexture(t, 'art').dispose();
        return;
      }
      trackTexture(t, 'art');
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = anisotropy;
      coverCrop(t);
      art.texture.dispose(); // yer tutucu gider
      art.texture = t;
      art.source = 'image';
    },
    undefined,
    // isteğe bağlı varlık — gelmezse sessizce yer tutucuda kalınır
    () => {},
  );

  return art;
}

/** Dev/QA: hangi pano gerçek görseli aldı. */
export function artSources(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, e] of arts) out[id] = e.art.source;
  return out;
}

/** Sahne kapanınca tüm pano dokuları bırakılır (bölüm 11). */
export function releaseArts() {
  for (const a of arts.values()) a.dispose();
  arts.clear();
}
