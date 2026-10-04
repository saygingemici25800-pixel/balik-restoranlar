'use client';

import { useRef } from 'react';
import type * as THREE from 'three';

import {
  CHAIR_BACK_H,
  CHAIR_D,
  CHAIR_SEAT_H,
  CHAIR_W,
  LEVEL_Y,
  SCENE_COLORS,
  TABLE_D,
  TABLE_H,
  TABLE_W,
} from '@/lib/zone/frames';
import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import { chairSpots, TABLES, type TableStyle } from '@/lib/zone/venue-layout';

/**
 * Masalar + sandalyeler — YALNIZ DEKOR: numara/etiket yok, tıklanmaz, hover yok, yakınlık
 * tetiklemez. Üç tarz (videodan), renkler örnek başına (`instanceColor`): tüm masalar ve
 * sandalyeler 6 çizim çağrısında.
 *   dış teras — açık mavi örtü, beyaz ahşap sandalye
 *   iç salon  — açık mavi örtü, bej döşemeli sandalye, koyu ayak
 *   üst kat   — lacivert örtü, açık mavi minderli beyaz sandalye
 */

const STYLE: Record<TableStyle, { cloth: string; seat: string; back: string; leg: string }> = {
  outdoor: { cloth: SCENE_COLORS.clothAqua, seat: SCENE_COLORS.chairWhite, back: SCENE_COLORS.chairWhite, leg: SCENE_COLORS.chairWhite },
  indoor: { cloth: SCENE_COLORS.clothAqua, seat: SCENE_COLORS.chairBeige, back: SCENE_COLORS.chairBeige, leg: SCENE_COLORS.chairLeg },
  upper: { cloth: SCENE_COLORS.clothNavy, seat: SCENE_COLORS.cushion, back: SCENE_COLORS.chairWhite, leg: SCENE_COLORS.chairWhite },
};

const TOP_T = 0.03;
const SKIRT_H = 0.24;
const LEG_T = 0.035;

const spots = TABLES.map((t) => ({ ...t, y: LEVEL_Y[t.level] }));

const CLOTHS = spots.map((t) => m4([t.x, t.y + TABLE_H - TOP_T / 2, t.z]));
const CLOTH_COLORS = spots.map((t) => STYLE[t.style].cloth);
/** Alttaki beyaz örtü: üst örtüden taşan etek. */
const SKIRTS = spots.map((t) => m4([t.x, t.y + TABLE_H - TOP_T - SKIRT_H / 2, t.z]));
/** Orta ayak: yerden eteğin altına (örtü altında masa havada durmaz). */
const PEDESTAL_H = TABLE_H - TOP_T - SKIRT_H;
const PEDESTALS = spots.map((t) => m4([t.x, t.y + PEDESTAL_H / 2, t.z]));

/** Her masada 4 sandalye (`chairSpots`): `side` −1 deniz, +1 iç taraf. */
const CHAIRS = spots.flatMap((t) => chairSpots(t).map((c) => ({ ...c, y: t.y, style: t.style })));
const SEATS = CHAIRS.map((c) => m4([c.x, c.y + CHAIR_SEAT_H, c.z]));
const SEAT_COLORS = CHAIRS.map((c) => STYLE[c.style].seat);
const BACKS = CHAIRS.map((c) =>
  m4([c.x, c.y + CHAIR_SEAT_H + CHAIR_BACK_H / 2, c.z + c.side * (CHAIR_D / 2 - LEG_T / 2)]),
);
const BACK_COLORS = CHAIRS.map((c) => STYLE[c.style].back);
const LEGS = CHAIRS.flatMap((c) =>
  [-1, 1].flatMap((lx) =>
    [-1, 1].map((lz) =>
      m4([c.x + lx * (CHAIR_W / 2 - LEG_T), c.y + CHAIR_SEAT_H / 2, c.z + lz * (CHAIR_D / 2 - LEG_T)]),
    ),
  ),
);
const LEG_COLORS = CHAIRS.flatMap((c) => [0, 1, 2, 3].map(() => STYLE[c.style].leg));

export function Tables() {
  const cloths = useRef<THREE.InstancedMesh>(null);
  const skirts = useRef<THREE.InstancedMesh>(null);
  const pedestals = useRef<THREE.InstancedMesh>(null);
  const seats = useRef<THREE.InstancedMesh>(null);
  const backs = useRef<THREE.InstancedMesh>(null);
  const legs = useRef<THREE.InstancedMesh>(null);

  useInstances(cloths, CLOTHS, CLOTH_COLORS);
  useInstances(skirts, SKIRTS);
  useInstances(pedestals, PEDESTALS);
  useInstances(seats, SEATS, SEAT_COLORS);
  useInstances(backs, BACKS, BACK_COLORS);
  useInstances(legs, LEGS, LEG_COLORS);

  return (
    <group name="zone-tables">
      <instancedMesh ref={cloths} args={[undefined, undefined, CLOTHS.length]} raycast={noRaycast}>
        <boxGeometry args={[TABLE_W + 0.14, TOP_T, TABLE_D + 0.14]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={skirts} args={[undefined, undefined, SKIRTS.length]} raycast={noRaycast}>
        <boxGeometry args={[TABLE_W + 0.1, SKIRT_H, TABLE_D + 0.1]} />
        <meshStandardMaterial color={SCENE_COLORS.clothWhite} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={pedestals} args={[undefined, undefined, PEDESTALS.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.05, 0.08, PEDESTAL_H, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.chairLeg} roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={seats} args={[undefined, undefined, SEATS.length]} raycast={noRaycast}>
        <boxGeometry args={[CHAIR_W, 0.06, CHAIR_D]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={backs} args={[undefined, undefined, BACKS.length]} raycast={noRaycast}>
        <boxGeometry args={[CHAIR_W, CHAIR_BACK_H, LEG_T]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={legs} args={[undefined, undefined, LEGS.length]} raycast={noRaycast}>
        <boxGeometry args={[LEG_T, CHAIR_SEAT_H, LEG_T]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
