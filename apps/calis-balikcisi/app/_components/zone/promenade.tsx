'use client';

import { useRef } from 'react';
import type * as THREE from 'three';

import { SAND_Y, SCENE_COLORS } from '@/lib/zone/frames';
import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import { BEACH_UMBRELLAS, PALMS, ROAD_LAMPS } from '@/lib/zone/venue-layout';

/**
 * Sahil yolu ve plaj (videodan): yol lambaları, yol boyunca palmiyeler, kumda hasır plaj
 * şemsiyeleri. Lamba başları ışıktan bağımsız parlak (gerçek ışık kaynağı yok — performans).
 */

const LAMP_H = 3.2;
const LAMP_POLES = ROAD_LAMPS.map((l) => m4([l.x, LAMP_H / 2, l.z]));
const LAMP_HEADS = ROAD_LAMPS.map((l) => m4([l.x, LAMP_H + 0.12, l.z]));

/** Palmiye gövdesi: birim yükseklik, boyla ölçeklenir, hafif eğik. */
const TRUNKS = PALMS.map((p) => m4([p.x + (p.lean * p.h) / 2, p.y + p.h / 2, p.z], [0, 0, -p.lean], [1, p.h, 1]));
/**
 * Yapraklar: tepeden dışa uzanan ince kutular. `YZX`: önce y etrafında yön, sonra uca doğru sarkma;
 * merkez, yaprağın yarı boyu kadar o yönde kaydırılır.
 */
const FROND_LEN = 2.4;
const FRONDS = PALMS.flatMap((p) => {
  const topX = p.x + p.lean * p.h;
  return Array.from({ length: 9 }, (_, k) => {
    const yaw = (k / 9) * Math.PI * 2 + p.h;
    const droop = 0.35 + (k % 3) * 0.12;
    const half = FROND_LEN / 2;
    return m4(
      [topX + Math.cos(yaw) * Math.cos(droop) * half, p.y + p.h - Math.sin(droop) * half, p.z - Math.sin(yaw) * Math.cos(droop) * half],
      [0, yaw, -droop],
      [1, 1, 1],
      'YZX',
    );
  });
});

const BEACH_POLE_H = 2.3;
const BEACH_POLES = BEACH_UMBRELLAS.map((b) => m4([b.x, SAND_Y + BEACH_POLE_H / 2, b.z]));
const BEACH_TOPS = BEACH_UMBRELLAS.map((b) => m4([b.x, SAND_Y + BEACH_POLE_H, b.z]));

export function Promenade() {
  const lampPoles = useRef<THREE.InstancedMesh>(null);
  const lampHeads = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const fronds = useRef<THREE.InstancedMesh>(null);
  const beachPoles = useRef<THREE.InstancedMesh>(null);
  const beachTops = useRef<THREE.InstancedMesh>(null);
  useInstances(lampPoles, LAMP_POLES);
  useInstances(lampHeads, LAMP_HEADS);
  useInstances(trunks, TRUNKS);
  useInstances(fronds, FRONDS);
  useInstances(beachPoles, BEACH_POLES);
  useInstances(beachTops, BEACH_TOPS);

  return (
    <group name="zone-promenade">
      <instancedMesh ref={lampPoles} args={[undefined, undefined, LAMP_POLES.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.045, 0.07, LAMP_H, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.lampPole} roughness={0.6} metalness={0.3} />
      </instancedMesh>
      <instancedMesh ref={lampHeads} args={[undefined, undefined, LAMP_HEADS.length]} raycast={noRaycast}>
        <sphereGeometry args={[0.17, 12, 8]} />
        <meshBasicMaterial color={SCENE_COLORS.lampHead} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, TRUNKS.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.13, 0.2, 1, 7]} />
        <meshStandardMaterial color={SCENE_COLORS.palmTrunk} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={fronds} args={[undefined, undefined, FRONDS.length]} raycast={noRaycast}>
        <boxGeometry args={[FROND_LEN, 0.03, 0.42]} />
        <meshStandardMaterial color={SCENE_COLORS.palmLeaf} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={beachPoles} args={[undefined, undefined, BEACH_POLES.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.03, 0.03, BEACH_POLE_H, 6]} />
        <meshStandardMaterial color={SCENE_COLORS.palmTrunk} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={beachTops} args={[undefined, undefined, BEACH_TOPS.length]} raycast={noRaycast}>
        <coneGeometry args={[1.2, 0.6, 10]} />
        <meshStandardMaterial color={SCENE_COLORS.beachUmbrella} roughness={1} flatShading />
      </instancedMesh>
    </group>
  );
}
