'use client';

import { useRef } from 'react';
import type * as THREE from 'three';

import { SCENE_COLORS } from '@/lib/zone/frames';
import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import { BORDER_PLANTERS, DRACAENA, DRACAENA_POT_R, FICUS, FICUS_POT_R } from '@/lib/zone/venue-layout';

/**
 * Bitkiler (videodan): sahil tarafında beyaz saksı sınırı ve çalılar, dış teras köşelerinde beyaz
 * yuvarlak saksıda ficus, zemin kat içinde uzun beyaz saksıda dracaena. Primitive, GLB yok.
 */

const PLANTER = { w: 1.8, d: 0.55, h: 0.55 };
const PLANTERS = BORDER_PLANTERS.map((p) => m4([p.x, PLANTER.h / 2, p.z]));
const SHRUBS = BORDER_PLANTERS.flatMap((p) =>
  [-0.5, 0, 0.5].map((dx, k) => m4([p.x + dx, PLANTER.h + 0.22, p.z], [0, p.x + k, 0], [1.3, 0.8, 1])),
);

const FICUS_POT_H = 0.6;
const FICUS_POTS = FICUS.map((f) => m4([f.x, FICUS_POT_H / 2, f.z]));
const FICUS_TRUNKS = FICUS.map((f) => m4([f.x, FICUS_POT_H + 0.6, f.z]));
const FICUS_CANOPY = FICUS.flatMap((f) =>
  [
    [0, 2.2, 0, 0.75],
    [0.35, 1.85, 0.2, 0.55],
    [-0.3, 1.9, -0.25, 0.55],
  ].map(([dx = 0, y = 0, dz = 0, r = 0.5]) => m4([f.x + dx, y, f.z + dz], [0, f.z, 0], [r, r * 0.9, r])),
);

const DRACAENA_POT_H = 0.85;
const DRACAENA_POTS = DRACAENA.map((d) => m4([d.x, DRACAENA_POT_H / 2, d.z]));
/** Uzun, sivri yaprak demetleri: ince, uzatılmış ikosahedronlar, farklı yönlere eğik. */
const DRACAENA_LEAVES = DRACAENA.flatMap((d) =>
  [0, 1, 2, 3, 4].map((k) =>
    m4([d.x, DRACAENA_POT_H + 0.45, d.z], [0.5, (k * 2 * Math.PI) / 5 + d.x, 0], [0.12, 0.7, 0.32], 'YXZ'),
  ),
);

export function Greenery() {
  const planters = useRef<THREE.InstancedMesh>(null);
  const shrubs = useRef<THREE.InstancedMesh>(null);
  const fPots = useRef<THREE.InstancedMesh>(null);
  const fTrunks = useRef<THREE.InstancedMesh>(null);
  const fCanopy = useRef<THREE.InstancedMesh>(null);
  const dPots = useRef<THREE.InstancedMesh>(null);
  const dLeaves = useRef<THREE.InstancedMesh>(null);
  useInstances(planters, PLANTERS);
  useInstances(shrubs, SHRUBS);
  useInstances(fPots, FICUS_POTS);
  useInstances(fTrunks, FICUS_TRUNKS);
  useInstances(fCanopy, FICUS_CANOPY);
  useInstances(dPots, DRACAENA_POTS);
  useInstances(dLeaves, DRACAENA_LEAVES);

  return (
    <group name="zone-greenery">
      <instancedMesh ref={planters} args={[undefined, undefined, PLANTERS.length]} raycast={noRaycast}>
        <boxGeometry args={[PLANTER.w, PLANTER.h, PLANTER.d]} />
        <meshStandardMaterial color={SCENE_COLORS.planter} roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={shrubs} args={[undefined, undefined, SHRUBS.length]} raycast={noRaycast}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={SCENE_COLORS.foliageLight} roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={fPots} args={[undefined, undefined, FICUS_POTS.length]} raycast={noRaycast}>
        <cylinderGeometry args={[FICUS_POT_R, FICUS_POT_R * 0.8, FICUS_POT_H, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.planter} roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={fTrunks} args={[undefined, undefined, FICUS_TRUNKS.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.04, 0.06, 1.2, 6]} />
        <meshStandardMaterial color={SCENE_COLORS.palmTrunk} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={fCanopy} args={[undefined, undefined, FICUS_CANOPY.length]} raycast={noRaycast}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={SCENE_COLORS.foliage} roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={dPots} args={[undefined, undefined, DRACAENA_POTS.length]} raycast={noRaycast}>
        <cylinderGeometry args={[DRACAENA_POT_R, DRACAENA_POT_R * 0.75, DRACAENA_POT_H, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.planter} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={dLeaves} args={[undefined, undefined, DRACAENA_LEAVES.length]} raycast={noRaycast}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={SCENE_COLORS.foliageLight} roughness={1} flatShading />
      </instancedMesh>
    </group>
  );
}
