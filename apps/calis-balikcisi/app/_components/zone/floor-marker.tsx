'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { BrandPalette } from '@/lib/zone/brand';
import { FLOOR_RECT, type FrameId, type Level, type PortalId } from '@/lib/zone/frames';
import { noRaycast } from '@/lib/zone/instancing';
import { useZoneStore } from '@/lib/zone/store';
import { acquireTexture, markerTexture, pulseTexture } from '@/lib/zone/textures';

/**
 * Zemin halkası (docs/zone-3d-modul.md bölüm 7.2). MANCH'ten aynen; panolar ve merdiven geçitleri
 * için ortak (geçitte daha küçük halka, tetikleme yarıçapı ona göre).
 *
 *   halka (y 0.014) — yavaş döner, yaklaşınca parlar
 *   nabız (y 0.016) — 0.5'ten 1.5'e büyüyerek söner, yaklaşınca hızlanır
 *
 * **Ölçü ilişkisi kritik:** `MARKER_SIZE = 4.6` → görünür yarıçap 2.3 < tetikleme 2.6.
 * Halka tetikleme alanının İÇİNDE kalır — "halkanın üstündeyim ama açılmadı" olmaz.
 *
 * Duvar dibindeki panoların halkası kat zemininin dikdörtgenine kırpılır (`FLOOR_RECT`):
 * camın/duvarın dışına taşıp boşlukta asılı görünmez. Kırpma `gl.localClippingEnabled` ister
 * (`zone-canvas` onCreated).
 */

type FloorMarkerProps = {
  /** Hangi hedefin halkası: yakınlık store'da bu kimlikle eşleşince parlar. */
  target: { kind: 'frame'; id: FrameId } | { kind: 'portal'; id: PortalId };
  position: readonly [number, number, number];
  level: Level;
  size: number;
  reduced: boolean;
  brand: BrandPalette;
};

export function FloorMarker({ target, position, level, size, reduced, brand }: FloorMarkerProps) {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const ring = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  /** Yakınlık vurgusu 0→1 arasında yumuşar; ani yanıp sönme olmaz. */
  const glow = useRef(0);
  const clip = useMemo(() => {
    const r = FLOOR_RECT[level];
    return [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -r.xMin),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), r.xMax),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -r.zMin),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), r.zMax),
    ];
  }, [level]);

  const [x, y, z] = position;
  const name = `${target.kind}-${target.id}`;

  useFrame((state, delta) => {
    const r = ring.current;
    const pl = pulse.current;
    if (!r || !pl) return;
    const dt = Math.min(delta, 0.05);

    const rMat = r.material as THREE.MeshBasicMaterial;
    const pMat = pl.material as THREE.MeshBasicMaterial;
    const ringTex = acquireTexture('marker', `${brand.fg}|${aniso}`, () => markerTexture(brand, aniso));
    if (rMat.map !== ringTex) {
      rMat.map = ringTex;
      rMat.needsUpdate = true;
    }
    const pulseTex = acquireTexture('pulse', String(aniso), () => pulseTexture(aniso));
    if (pMat.map !== pulseTex) {
      pMat.map = pulseTex;
      pMat.needsUpdate = true;
    }

    // Store'a ABONE OLUNMAZ: yakınlık her karede okunur ama React render etmez.
    const zone = useZoneStore.getState();
    // POV'da sahne render'ı sürer ama halka nabzı DURUR (bölüm 11).
    if (zone.state === 'pov') return;
    const near = (target.kind === 'frame' ? zone.nearFrame : zone.nearPortal) === target.id ? 1 : 0;
    glow.current += (near - glow.current) * Math.min(1, dt * 6);
    const g = glow.current;

    if (reduced) {
      // Dönmez, atmaz: yaklaşınca sabit vurgu (bölüm 12).
      r.rotation.z = 0;
      rMat.opacity = 0.3 + g * 0.5;
      pMat.opacity = 0;
      pl.scale.setScalar(1);
      return;
    }

    const now = state.clock.elapsedTime;
    r.rotation.z = -now * 0.18;
    rMat.opacity = 0.3 + g * 0.55;

    const ph = (now * (0.75 + g * 0.85)) % 1;
    const scale = 0.5 + ph;
    pl.scale.set(scale, scale, 1);
    pMat.opacity = (1 - ph) * (0.22 + g * 0.5);
  });

  return (
    <group>
      <mesh
        ref={ring}
        name={`zone-ring-${name}`}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[x, y + 0.014, z]}
        raycast={noRaycast}
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial transparent opacity={0.3} depthWrite={false} toneMapped={false} clippingPlanes={clip} />
      </mesh>
      {/* Nabız beyaz çizilir, materyalde marka aksanına boyanır. */}
      <mesh
        ref={pulse}
        name={`zone-pulse-${name}`}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[x, y + 0.016, z]}
        raycast={noRaycast}
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          color={brand.accent}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          clippingPlanes={clip}
        />
      </mesh>
    </group>
  );
}
