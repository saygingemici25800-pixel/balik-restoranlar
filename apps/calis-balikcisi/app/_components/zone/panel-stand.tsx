'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';

import { acquireArt } from '@/lib/zone/art';
import type { BrandPalette } from '@/lib/zone/brand';
import {
  ART_H,
  ART_W,
  BOARD_H,
  BOARD_W,
  BOARD_Y,
  LEVEL_Y,
  SCENE_COLORS,
  type ZoneFrame,
} from '@/lib/zone/frames';
import { noRaycast } from '@/lib/zone/instancing';

/**
 * Ayaklı pano (MANCH `Frame.tsx` karşılığı): koyu çerçeve + kum paspartu + görsel, iki ayak.
 * Bir duvarın 12 cm önünde, bulunduğu katta durur; yüzü duvarın normaline (`nx/nz`) bakar.
 * Görsel `useFrame`'de takılır: yer tutucu → gerçek fotoğraf geçişi orada olur.
 *
 * Kamera panonun ARKASINA geçince (duvarın dışı — kesit görünümü) pano duvarla birlikte gizlenir:
 * arkası karakteri kapatmaz, kamera panonun içinden geçmez (inceleme).
 */

const LEG_H = BOARD_Y - BOARD_H / 2 + 0.25;

type PanelStandProps = { frame: ZoneFrame; brand: BrandPalette; fontEpoch: number };

export function PanelStand({ frame, brand, fontEpoch }: PanelStandProps) {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const art = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);

  // Düzlemin normali (+z), y etrafında döndürülünce (sin, cos) olur: yüz (nx, nz)'ye baksın.
  const rotY = Math.atan2(frame.nx, frame.nz);

  useFrame(({ camera }) => {
    const g = group.current;
    if (g) {
      const front = (camera.position.x - frame.x) * frame.nx + (camera.position.z - frame.z) * frame.nz;
      g.visible = front > 0.06;
    }
    const mesh = art.current;
    if (!mesh) return;
    const texture = acquireArt(frame, brand, fontEpoch, aniso).texture;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    if (mat.map !== texture) {
      mat.map = texture;
      mat.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={[frame.x, LEVEL_Y[frame.level], frame.z]} rotation={[0, rotY, 0]}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (BOARD_W / 2 - 0.12), LEG_H / 2, -0.04]} raycast={noRaycast}>
          <boxGeometry args={[0.06, LEG_H, 0.06]} />
          <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, BOARD_Y, 0]} raycast={noRaycast}>
        <boxGeometry args={[BOARD_W + 0.1, BOARD_H + 0.1, 0.05]} />
        <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.7} />
      </mesh>
      <mesh position={[0, BOARD_Y, 0.03]} raycast={noRaycast}>
        <planeGeometry args={[BOARD_W, BOARD_H]} />
        <meshStandardMaterial color={brand.fg} roughness={0.9} />
      </mesh>
      {/* `transparent`: alfalı görsel düz blok çıkmasın (bölüm 13). Işıktan bağımsız: akşamda da okunur. */}
      <mesh ref={art} name={`zone-art-${frame.id}`} position={[0, BOARD_Y, 0.035]} raycast={noRaycast}>
        <planeGeometry args={[ART_W, ART_H]} />
        <meshBasicMaterial transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
