'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import type { Crowd, ItemKind } from '@/lib/zone/npc/roster';

/**
 * Dolu masaların sofraları: tabak, kâse, bardak, çay, balık, kalamar, ekmek, meyve. Yalnız
 * dekor (etiketsiz, tıklanmaz). Üç çizim çağrısı: silindirler, balıklar, küçük yuvarlaklar —
 * renkler örnek başına (`instanceColor`).
 */

/** Balık: basık elipsoid gövde + yatık kuyruk (tabakta yan yatmış). */
function fishGeometry() {
  const body = new THREE.SphereGeometry(1, 10, 6);
  body.scale(0.085, 0.022, 0.032);
  const tail = new THREE.ConeGeometry(0.03, 0.05, 4);
  tail.rotateZ(Math.PI / 2);
  tail.scale(1, 0.35, 1);
  tail.translate(0.105, 0, 0);
  const parts = [body.toNonIndexed(), tail.toNonIndexed()];
  const pos: number[] = [];
  const nor: number[] = [];
  for (const p of parts) {
    pos.push(...(p.getAttribute('position').array as Float32Array));
    nor.push(...(p.getAttribute('normal').array as Float32Array));
  }
  [body, tail, ...parts].forEach((g) => g.dispose());
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}

function useKind(crowd: Crowd, kind: ItemKind) {
  return useMemo(() => {
    const list = crowd.items.filter((it) => it.kind === kind);
    return {
      matrices: list.map((it) => m4([it.x, it.y, it.z], [0, it.rotY, 0], [it.sx, it.sy, it.sz])),
      colors: list.map((it) => it.color),
    };
  }, [crowd, kind]);
}

export function TableSettings({ crowd }: { crowd: Crowd }) {
  const cyl = useRef<THREE.InstancedMesh>(null);
  const fish = useRef<THREE.InstancedMesh>(null);
  const ball = useRef<THREE.InstancedMesh>(null);
  const cyls = useKind(crowd, 'cyl');
  const fishes = useKind(crowd, 'fish');
  const balls = useKind(crowd, 'ball');
  const fishGeo = useMemo(fishGeometry, []);

  useInstances(cyl, cyls.matrices, cyls.colors);
  useInstances(fish, fishes.matrices, fishes.colors);
  useInstances(ball, balls.matrices, balls.colors);

  if (crowd.items.length === 0) return null;
  return (
    <group name="zone-table-settings">
      <instancedMesh ref={cyl} args={[undefined, undefined, cyls.matrices.length]} raycast={noRaycast}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={fish} args={[fishGeo, undefined, fishes.matrices.length]} raycast={noRaycast}>
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={ball} args={[undefined, undefined, balls.matrices.length]} raycast={noRaycast}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshLambertMaterial />
      </instancedMesh>
    </group>
  );
}
