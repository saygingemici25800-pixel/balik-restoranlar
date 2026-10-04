'use client';

import { useRef } from 'react';
import type * as THREE from 'three';

import { LEVEL_Y, SCENE_COLORS, STAIR, STAIR_WALK } from '@/lib/zone/frames';
import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';

/**
 * Dış merdiven (videodan): binanın +x yanında, açık havada, mavi demir korkuluklu beton basamaklar.
 * Zemin kapısı (vitrinin yanında) duvar dibindeki yürüme yoluna açılır; merdiven yolun dışında,
 * arkadan (z 5.6, y 0) denize doğru yükselir, sahanlıktan köprüyle (y 4) üst katın yan kapısına
 * girer. Görseldir: katlar arası geçiş halka + prompt ile (`portals`).
 */

const TOP = LEVEL_Y[1];
const WIDTH = STAIR.xMax - STAIR.xMin;
const MID_X = (STAIR.xMin + STAIR.xMax) / 2;
const RUN = (STAIR.zBottom - STAIR.zTop) / STAIR.steps;
const RISE = TOP / STAIR.steps;
const LANDING_D = STAIR.zTop - STAIR.landingZ;
const LANDING_MID = (STAIR.zTop + STAIR.landingZ) / 2;
const BRIDGE_W = STAIR.xMin - STAIR_WALK.x0;
const BRIDGE_T = 0.25;

/** Basamaklar dolu blok: her biri yerden kendi basamak yüksekliğine (havada asılı durmaz). */
const STEPS = Array.from({ length: STAIR.steps }, (_, i) => {
  const h = (i + 1) * RISE;
  return m4([MID_X, h / 2, STAIR.zBottom - (i + 0.5) * RUN], [0, 0, 0], [WIDTH, h, RUN]);
});

const RAIL_H = 0.95;
/** İki yan korkuluk: dış kenar ve yürüme yoluna bakan iç kenar. */
const RAIL_XS = [STAIR.xMax - 0.04, STAIR.xMin + 0.04];
/** Korkuluk dikmeleri: her 3 basamakta bir (iki yanda) + sahanlık ve köprü kenarları. */
const POSTS = [
  ...RAIL_XS.flatMap((x) =>
    Array.from({ length: Math.floor(STAIR.steps / 3) + 1 }, (_, k) => {
      const i = Math.min(STAIR.steps - 1, k * 3);
      const y = (i + 1) * RISE;
      return m4([x, y + RAIL_H / 2, STAIR.zBottom - (i + 0.5) * RUN]);
    }),
  ),
  ...[STAIR.zTop - 0.5, STAIR.landingZ + 0.04].map((z) => m4([STAIR.xMax - 0.04, TOP + RAIL_H / 2, z])),
  ...[STAIR_WALK.x0 + 0.1, STAIR_WALK.x0 + BRIDGE_W / 2, STAIR.xMin].flatMap((x) => [
    m4([x, TOP + RAIL_H / 2, STAIR.landingZ + 0.04]),
    m4([x, TOP + RAIL_H / 2, STAIR.zTop - 0.04]),
  ]),
];
const SLOPE = Math.atan2(TOP, STAIR.zBottom - STAIR.zTop);
const RAIL_LEN = Math.hypot(TOP, STAIR.zBottom - STAIR.zTop);

/** Yatay küpeşteler: dış sahanlık kenarı (z boyunca), deniz kenarı ve köprünün arka kenarı (x boyunca). */
const BARS: { pos: [number, number, number]; size: [number, number, number] }[] = [
  { pos: [STAIR.xMax - 0.04, TOP + RAIL_H, LANDING_MID], size: [0.05, 0.05, LANDING_D + 0.1] },
  {
    pos: [(STAIR_WALK.x0 + STAIR.xMax) / 2, TOP + RAIL_H, STAIR.landingZ + 0.04],
    size: [STAIR.xMax - STAIR_WALK.x0, 0.05, 0.05],
  },
  { pos: [STAIR_WALK.x0 + BRIDGE_W / 2, TOP + RAIL_H, STAIR.zTop - 0.04], size: [BRIDGE_W, 0.05, 0.05] },
];

/** Merdivenin dışında, videodaki gibi iki ağaç. */
const TREES = [
  { x: STAIR.xMax + 1.6, z: 3.8 },
  { x: STAIR.xMax + 1.9, z: 0.2 },
];

export function Stairs() {
  const steps = useRef<THREE.InstancedMesh>(null);
  const posts = useRef<THREE.InstancedMesh>(null);
  useInstances(steps, STEPS);
  useInstances(posts, POSTS);

  return (
    <group name="zone-stairs">
      {/* yürüme yolu: zemin kapısından merdivenin dibine */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(STAIR_WALK.x0 + STAIR_WALK.x1) / 2, 0.006, (STAIR_WALK.z0 + STAIR_WALK.z1) / 2]}
        raycast={noRaycast}
      >
        <planeGeometry args={[STAIR_WALK.x1 - STAIR_WALK.x0, STAIR_WALK.z1 - STAIR_WALK.z0]} />
        <meshStandardMaterial color={SCENE_COLORS.road} roughness={0.95} />
      </mesh>
      <instancedMesh ref={steps} args={[undefined, undefined, STEPS.length]} raycast={noRaycast}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={SCENE_COLORS.road} roughness={0.95} />
      </instancedMesh>
      {/* sahanlık (merdivenin üstü, dolu) + üst kat yan kapısına köprü (yolun üstünden geçer) */}
      <mesh position={[MID_X, TOP / 2, LANDING_MID]}>
        <boxGeometry args={[WIDTH, TOP, LANDING_D]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
      </mesh>
      <mesh position={[STAIR_WALK.x0 + BRIDGE_W / 2, TOP - BRIDGE_T / 2, LANDING_MID]}>
        <boxGeometry args={[BRIDGE_W, BRIDGE_T, LANDING_D]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
      </mesh>
      {/* mavi korkuluk: dikmeler + iki yanda eğimli küpeşte + sahanlık/köprü küpeşteleri */}
      <instancedMesh ref={posts} args={[undefined, undefined, POSTS.length]} raycast={noRaycast}>
        <boxGeometry args={[0.04, RAIL_H, 0.04]} />
        <meshStandardMaterial color={SCENE_COLORS.stairBlue} roughness={0.5} />
      </instancedMesh>
      {RAIL_XS.map((x) => (
        <mesh key={x} position={[x, TOP / 2 + RAIL_H, (STAIR.zBottom + STAIR.zTop) / 2]} rotation={[SLOPE, 0, 0]}>
          <boxGeometry args={[0.05, 0.05, RAIL_LEN]} />
          <meshStandardMaterial color={SCENE_COLORS.stairBlue} roughness={0.5} />
        </mesh>
      ))}
      {BARS.map((b) => (
        <mesh key={b.pos.join()} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={SCENE_COLORS.stairBlue} roughness={0.5} />
        </mesh>
      ))}
      {TREES.map((t) => (
        <group key={t.z} position={[t.x, 0, t.z]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.1, 0.16, 3.2, 7]} />
            <meshStandardMaterial color={SCENE_COLORS.palmTrunk} roughness={1} />
          </mesh>
          <mesh position={[0, 3.7, 0]} scale={[1.4, 1.1, 1.4]}>
            <icosahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color={SCENE_COLORS.foliage} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}
