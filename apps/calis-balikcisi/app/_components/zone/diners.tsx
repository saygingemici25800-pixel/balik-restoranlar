'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { LEVEL_Y } from '@/lib/zone/frames';
import { buildBodyGeometry } from '@/lib/zone/npc/body';
import { createCrowdMaterial } from '@/lib/zone/npc/crowd-material';
import { type Crowd, PALETTE } from '@/lib/zone/npc/roster';
import { noRaycast } from '@/lib/zone/instancing';
import { zoneRuntime } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Masada oturan kurgusal misafirler — hepsi TEK çizim çağrısında (instanced 3B gövde, toon).
 * Yön, silüet, yemek yeme ve soluklaşma shader'da (`crowd-material`); burada kare başına
 * yalnız iki uniform yazılır. Yalnız dekor: raycast yok, yakınlık tetiklemez.
 *
 * POV ve kat geçişinde zaman durur (bölüm 11: POV'da animasyon durur); hareket azaltmada
 * herkes yerinde, çatal inmiş.
 */

type DinersProps = { crowd: Crowd; reduced: boolean };

const tmpM = new THREE.Matrix4();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const ID_Q = new THREE.Quaternion();

export function Diners({ crowd, reduced }: DinersProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { diners } = crowd;

  const geometry = useMemo(() => {
    const g = buildBodyGeometry('seated');
    const n = diners.length;
    const face = new Float32Array(n);
    const row = new Float32Array(n);
    const pal = new Float32Array(n * 4);
    const anim = new Float32Array(n * 2);
    diners.forEach((d, i) => {
      face[i] = d.face;
      row[i] = d.row;
      pal.set(d.pal, i * 4);
      anim[i * 2] = d.phase;
      anim[i * 2 + 1] = d.period;
    });
    g.setAttribute('aFace', new THREE.InstancedBufferAttribute(face, 1));
    g.setAttribute('aRow', new THREE.InstancedBufferAttribute(row, 1));
    g.setAttribute('aPal', new THREE.InstancedBufferAttribute(pal, 4));
    g.setAttribute('aAnim', new THREE.InstancedBufferAttribute(anim, 2));
    return g;
  }, [diners]);

  const material = useMemo(() => createCrowdMaterial('seated', PALETTE), []);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    diners.forEach((d, i) => {
      m.setMatrixAt(i, tmpM.compose(tmpP.set(d.x, d.y, d.z), ID_Q, tmpS.setScalar(d.scale)));
    });
    m.count = diners.length;
    m.instanceMatrix.needsUpdate = true;
  }, [diners]);

  useFrame((_, delta) => {
    const u = material.uniforms;
    u.uEat.value = reduced ? 0 : 1;
    if (!reduced && useZoneStore.getState().state === 'zone') u.uTime.value += Math.min(delta, 0.05);
    const { char, debug } = zoneRuntime();
    // film çekiminde (lab) kahramana göre soluklaşma yok: kadrajda noktalı insan kalmasın
    u.uHero.value.set(char.x, debug.cinema ? -100 : LEVEL_Y[char.level], char.z);
  });

  if (diners.length === 0) return null;
  return (
    <instancedMesh
      ref={mesh}
      name="zone-diners"
      args={[geometry, material, diners.length]}
      raycast={noRaycast}
      // yön ve poz shader'da: geometri sınırı gerçeği yansıtmaz — tek çağrı, kırpma yok
      frustumCulled={false}
    />
  );
}
