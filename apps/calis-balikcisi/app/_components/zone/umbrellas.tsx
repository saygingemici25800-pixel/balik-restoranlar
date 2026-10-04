'use client';

import { useRef } from 'react';
import { DoubleSide, type InstancedMesh } from 'three';

import { SCENE_COLORS, UMBRELLA } from '@/lib/zone/frames';
import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import { UMBRELLAS } from '@/lib/zone/venue-layout';

/**
 * Dış terasın büyük kare beyaz şemsiyeleri (videodan): direk masanın ortasından çıkar, kanopi
 * kare piramit. Kanopi kenarı 2.8, tepe 3.25 — kamera (2.45) altından geçer; direkler kamera
 * engeli (`CAMERA_POSTS`).
 */

const CANOPY_H = UMBRELLA.peakY - UMBRELLA.edgeY;
/** 4 kenarlı koni = kare piramit; köşeden köşeye yarıçap. π/4 dönüşle kenarlar eksenlere paralel. */
const CANOPY_R = UMBRELLA.size / Math.SQRT2;

const POLES = UMBRELLAS.map((u) => m4([u.x, UMBRELLA.peakY / 2, u.z]));
const CANOPIES = UMBRELLAS.map((u) => m4([u.x, UMBRELLA.edgeY + CANOPY_H / 2, u.z], [0, Math.PI / 4, 0]));

export function Umbrellas() {
  const poles = useRef<InstancedMesh>(null);
  const canopies = useRef<InstancedMesh>(null);
  useInstances(poles, POLES);
  useInstances(canopies, CANOPIES);

  return (
    <group name="zone-umbrellas">
      <instancedMesh ref={poles} args={[undefined, undefined, POLES.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.04, 0.05, UMBRELLA.peakY, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.steel} roughness={0.4} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={canopies} args={[undefined, undefined, CANOPIES.length]} raycast={noRaycast}>
        <coneGeometry args={[CANOPY_R, CANOPY_H, 4, 1, true]} />
        <meshStandardMaterial color={SCENE_COLORS.umbrella} roughness={0.9} side={DoubleSide} />
      </instancedMesh>
    </group>
  );
}
