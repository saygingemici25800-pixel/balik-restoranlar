import * as THREE from 'three';

import { CHAR_VIEWS } from '@/lib/zone/figure';
import { acquireTexture, trackTexture } from '@/lib/zone/textures';
import { SILS } from './pen';
import { drawSeated, SEATED_CELL } from './person';
import { drawStanding, STANDING_CELL, STANDING_FRAMES, type StandingFrame } from './person-standing';

/**
 * Misafir atlasları: satır = silüet (`SILS`), sütun = kare × 4 görünüm (kare k → sütun 4k..4k+3).
 *   oturan: 2 kare (eller masada / çatal ağızda) → 8 sütun × 128 px
 *   ayakta: 4 kare (duruş / adım / geçiş / telefon) → 16 sütun × 96 px
 * Renk değil anahtar taşır → `NoColorSpace` (veri): sRGB işaretlenirse anahtarlar yanlış çözülür.
 * Yuvalı (`acquireTexture`) — sahne kapanınca `releaseTextureSlots` bırakır.
 */
export const SEATED_COLS = 8;
export const SEATED_ATLAS = { w: SEATED_CELL.w * SEATED_COLS, h: 1024 } as const;
export const STANDING_COLS = STANDING_FRAMES * 4;
export const STANDING_ATLAS = { w: STANDING_CELL.w * STANDING_COLS, h: 1024 } as const;

function atlasCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  if (!x) throw new Error('zone: 2d canvas bağlamı alınamadı');
  return { c, x };
}

function keyTexture(c: HTMLCanvasElement, label: string) {
  const t = trackTexture(new THREE.CanvasTexture(c), label);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

function makeSeatedAtlas(): THREE.Texture {
  const { c, x } = atlasCanvas(SEATED_ATLAS.w, SEATED_ATLAS.h);
  SILS.forEach((sil, row) => {
    for (const frame of [0, 1] as const) {
      CHAR_VIEWS.forEach((view, v) => {
        drawSeated(x, (frame * 4 + v) * SEATED_CELL.w, row * SEATED_CELL.h, sil, view, frame);
      });
    }
  });
  return keyTexture(c, 'npcSeated');
}

function makeStandingAtlas(): THREE.Texture {
  const { c, x } = atlasCanvas(STANDING_ATLAS.w, STANDING_ATLAS.h);
  SILS.forEach((sil, row) => {
    for (let f = 0; f < STANDING_FRAMES; f++) {
      CHAR_VIEWS.forEach((view, v) => {
        drawStanding(x, (f * 4 + v) * STANDING_CELL.w, row * STANDING_CELL.h, sil, view, f as StandingFrame);
      });
    }
  });
  return keyTexture(c, 'npcStanding');
}

export const acquireSeatedAtlas = () => acquireTexture('npcSeated', 'v1', makeSeatedAtlas);
export const acquireStandingAtlas = () => acquireTexture('npcStanding', 'v1', makeStandingAtlas);
