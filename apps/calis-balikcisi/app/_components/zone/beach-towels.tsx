'use client';

import { useMemo, useRef } from 'react';
import type * as THREE from 'three';

import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import type { TableItem } from '@/lib/zone/npc/roster';

/** Kumdaki havlular (oturanların altında) — dekor, tek çizim çağrısı, renk örnek başına. */
export function BeachTowels({ towels }: { towels: readonly TableItem[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { matrices, colors } = useMemo(
    () => ({
      matrices: towels.map((t) => m4([t.x, t.y, t.z], [0, t.rotY, 0], [t.sx, t.sy, t.sz])),
      colors: towels.map((t) => t.color),
    }),
    [towels],
  );
  useInstances(ref, matrices, colors);
  if (towels.length === 0) return null;
  return (
    <instancedMesh ref={ref} name="zone-beach-towels" args={[undefined, undefined, towels.length]} raycast={noRaycast}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}
