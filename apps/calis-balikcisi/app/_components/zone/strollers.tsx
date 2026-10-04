'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { readBrand } from '@/lib/zone/brand';
import { LEVEL_Y } from '@/lib/zone/frames';
import { noRaycast } from '@/lib/zone/instancing';
import { type Ambient, stepAmbient } from '@/lib/zone/npc/ambient';
import { acquireStandingAtlas } from '@/lib/zone/npc/atlas';
import { createCrowdMaterial } from '@/lib/zone/npc/crowd-material';
import { PALETTE } from '@/lib/zone/npc/roster';
import { zoneRuntime } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';
import { acquireShadowTexture } from '@/lib/zone/textures';

/**
 * Ayakta duran ve yürüyen kurgusal insanlar (sahil yolu, kumsal, yanlar) — TEK çizim çağrısı,
 * gölgeleri bir çağrı daha. Kare, aynalama, sekme ve uçlarda solma shader'da; CPU yalnız
 * yürüyenlerin konumunu ilerletir (`stepAmbient`) ve onların örnek verisini yazar.
 *
 * POV ve kat geçişinde dünya durur; hareket azaltmada herkes yerinde, duruş karesinde.
 * Gölgeler kahramanın ortak gölge dokusunu kullanır; düşük kademede gölge yok.
 */

type StrollersProps = { ambient: Ambient; reduced: boolean; shadows: boolean };

const SHADOW: [number, number] = [0.7, 0.45];
const tmpM = new THREE.Matrix4();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const ID_Q = new THREE.Quaternion();
const FLAT_Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
/** Yürüyenlerde her kare değişen örnek verisi (sabit dizi: kare başına allocation yok). */
const DYNAMIC = ['aFace', 'aMode', 'aVis'] as const;

export function Strollers({ ambient, reduced, shadows }: StrollersProps) {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const mesh = useRef<THREE.InstancedMesh>(null);
  const shadowMesh = useRef<THREE.InstancedMesh>(null);
  const list = ambient.strollers;
  const movers = useMemo(() => list.flatMap((s, i) => (s.path ? [i] : [])), [list]);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.translate(0, 0.5, 0);
    const n = list.length;
    const attr = (size: number, fill: (s: (typeof list)[number], out: Float32Array, i: number) => void) => {
      const a = new Float32Array(n * size);
      list.forEach((s, i) => fill(s, a, i));
      return new THREE.InstancedBufferAttribute(a, size);
    };
    g.setAttribute('aFace', attr(1, (s, a, i) => void (a[i] = s.face)));
    g.setAttribute('aRow', attr(1, (s, a, i) => void (a[i] = s.row)));
    g.setAttribute('aPal', attr(4, (s, a, i) => a.set(s.pal, i * 4)));
    g.setAttribute('aAnim', attr(2, (s, a, i) => a.set([s.phase, s.rate], i * 2)));
    g.setAttribute('aMode', attr(1, (s, a, i) => void (a[i] = s.mode)));
    g.setAttribute('aVis', attr(1, (s, a, i) => void (a[i] = s.vis)));
    for (const name of DYNAMIC) {
      (g.getAttribute(name) as THREE.InstancedBufferAttribute).setUsage(THREE.DynamicDrawUsage);
    }
    return g;
  }, [list]);

  const material = useMemo(() => createCrowdMaterial('standing', acquireStandingAtlas(), PALETTE, readBrand().bg), []);

  const write = (i: number) => {
    const s = list[i];
    if (!s) return;
    mesh.current?.setMatrixAt(i, tmpM.compose(tmpP.set(s.x, s.y, s.z), ID_Q, tmpS.setScalar(s.scale)));
    shadowMesh.current?.setMatrixAt(
      i,
      // gölge de uçlarda kişiyle birlikte solar (vis 0 → ölçek 0)
      tmpM.compose(tmpP.set(s.x, s.y + 0.015, s.z), FLAT_Q, tmpS.set(SHADOW[0] * s.scale * s.vis, SHADOW[1] * s.scale * s.vis, 1)),
    );
    const g = geometry;
    (g.getAttribute('aFace').array as Float32Array)[i] = s.face;
    (g.getAttribute('aMode').array as Float32Array)[i] = s.mode;
    (g.getAttribute('aVis').array as Float32Array)[i] = s.vis;
  };

  useLayoutEffect(() => {
    list.forEach((_, i) => write(i));
    for (const m of [mesh.current, shadowMesh.current]) {
      if (!m) continue;
      m.count = list.length;
      m.instanceMatrix.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  useFrame((_, delta) => {
    const u = material.uniforms;
    const atlas = acquireStandingAtlas();
    if (u.uAtlas.value !== atlas) u.uAtlas.value = atlas;
    u.uMove.value = reduced ? 0 : 1;
    const { char } = zoneRuntime();
    u.uHero.value.set(char.x, LEVEL_Y[char.level], char.z);

    const sh = shadowMesh.current;
    if (sh) {
      const mat = sh.material as THREE.MeshBasicMaterial;
      const tex = acquireShadowTexture(aniso);
      if (mat.map !== tex) {
        mat.map = tex;
        mat.needsUpdate = true;
      }
    }

    if (reduced || useZoneStore.getState().state !== 'zone' || movers.length === 0) return;
    const dt = Math.min(delta, 0.05);
    u.uTime.value += dt;
    stepAmbient(list, dt);
    for (const i of movers) write(i);
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
    if (sh) sh.instanceMatrix.needsUpdate = true;
    for (const name of DYNAMIC) geometry.getAttribute(name).needsUpdate = true;
  });

  if (list.length === 0) return null;
  return (
    <group name="zone-strollers">
      <instancedMesh
        ref={mesh}
        name="zone-strollers-people"
        args={[geometry, material, list.length]}
        raycast={noRaycast}
        // billboard genişliği shader'da: geometri sınırı gerçeği yansıtmaz
        frustumCulled={false}
      />
      {shadows ? (
        <instancedMesh ref={shadowMesh} args={[undefined, undefined, list.length]} raycast={noRaycast} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
          {/* ilk karede de dokulu (yoksa bir kare beyaz kare görünür); sonra useFrame tazeler */}
          <meshBasicMaterial map={acquireShadowTexture(aniso)} transparent depthWrite={false} opacity={0.75} toneMapped={false} />
        </instancedMesh>
      ) : null}
    </group>
  );
}
