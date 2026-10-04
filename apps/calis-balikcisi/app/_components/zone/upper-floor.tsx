'use client';

import { useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import {
  BACK_Z,
  FACADE_Z,
  HALF_W,
  LEVEL_Y,
  SCENE_COLORS,
  UPPER_ROOF_Y,
  UPPER_SIDE_DOOR_Z,
} from '@/lib/zone/frames';
import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import { acquireTexture, muralTexture, tileTexture } from '@/lib/zone/textures';
import { HEATERS, UPPER_CHANDELIERS, UPPER_FANS } from '@/lib/zone/venue-layout';

/**
 * Üst kat teras (videodan): cam oda — siyah çerçeveli cam ön yüz ve yanlar, gri alüminyum
 * lamelli pergola çatı, dalga resimli arka duvar, vantilatörler, halatlı ahşap avizeler, kapı
 * yanında ısıtıcılar. Zemin kat tavanının üstünde (y 4). Kamera (6.45) tavan donanımının altında.
 */

const Y0 = LEVEL_Y[1];
const H = UPPER_ROOF_Y - Y0;
const WIDTH = HALF_W * 2;
const DEPTH = BACK_Z - FACADE_Z;
const MID_Z = (BACK_Z + FACADE_Z) / 2;

const SLATS = Array.from({ length: Math.round((DEPTH + 0.8) / 0.32) }, (_, i) =>
  m4([0, UPPER_ROOF_Y, FACADE_Z - 0.4 + i * 0.32]),
);
/** Lameller sırayla açık/koyu: alttan bakınca düz levha değil, videodaki çizgili pergola okunur. */
const SLAT_COLORS = SLATS.map((_, i) => (i % 2 ? SCENE_COLORS.slatDark : SCENE_COLORS.slat));
/** Ön camın dikey kayıtları (2.5 m'de bir) ve yan camlarınki. */
const MULLIONS = [
  ...Array.from({ length: 13 }, (_, i) => m4([-HALF_W + i * 2.5, Y0 + H / 2, FACADE_Z])),
  ...[-1, 1].flatMap((side) =>
    Array.from({ length: 4 }, (_, i) => m4([side * HALF_W, Y0 + H / 2, FACADE_Z + i * 3])),
  ),
];
const FAN_Y = UPPER_ROOF_Y - 0.25;
const FAN_BLADES = UPPER_FANS.flatMap((f) =>
  [0, 1, 2].map((k) => m4([f.x, FAN_Y, f.z], [0, (k * 2 * Math.PI) / 3, 0])),
);
const CHANDELIER_Y = UPPER_ROOF_Y - 0.3;
const BULBS = UPPER_CHANDELIERS.flatMap((c) =>
  [-0.5, -0.17, 0.17, 0.5].map((dx) => m4([c.x + dx, CHANDELIER_Y - 0.12, c.z])),
);

export function UpperFloor() {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const slats = useRef<THREE.InstancedMesh>(null);
  const mullions = useRef<THREE.InstancedMesh>(null);
  const blades = useRef<THREE.InstancedMesh>(null);
  const bulbs = useRef<THREE.InstancedMesh>(null);
  useInstances(slats, SLATS, SLAT_COLORS);
  useInstances(mullions, MULLIONS);
  useInstances(blades, FAN_BLADES);
  useInstances(bulbs, BULBS);

  const floor = acquireTexture('upTile', String(aniso), () =>
    tileTexture('upTile', SCENE_COLORS.indoorTile, SCENE_COLORS.indoorSeam, aniso, [WIDTH / 0.9, DEPTH / 0.9]),
  );
  const mural = acquireTexture('mural', '0', () => muralTexture(WIDTH, H));
  const [d0, d1] = UPPER_SIDE_DOOR_Z;

  return (
    <group name="zone-upper">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y0, MID_Z]}>
        <planeGeometry args={[WIDTH, DEPTH]} />
        <meshStandardMaterial map={floor} roughness={0.6} />
      </mesh>
      {/* arka duvar: dalga resmi, içeri bakar */}
      <mesh position={[0, Y0 + H / 2, BACK_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[WIDTH, H]} />
        <meshStandardMaterial map={mural} roughness={0.9} />
      </mesh>
      {/* camlar: ön yüz + iki yan (+x'te merdiven kapısı açıklığı) */}
      <Glass position={[0, Y0 + H / 2, FACADE_Z]} size={[WIDTH, H]} rotY={0} />
      <Glass position={[-HALF_W, Y0 + H / 2, MID_Z]} size={[DEPTH, H]} rotY={Math.PI / 2} />
      <Glass position={[HALF_W, Y0 + H / 2, (FACADE_Z + d0) / 2]} size={[d0 - FACADE_Z, H]} rotY={-Math.PI / 2} />
      <Glass position={[HALF_W, Y0 + H / 2, (d1 + BACK_Z) / 2]} size={[BACK_Z - d1, H]} rotY={-Math.PI / 2} />
      <instancedMesh ref={mullions} args={[undefined, undefined, MULLIONS.length]} raycast={noRaycast}>
        <boxGeometry args={[0.045, H, 0.045]} />
        <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.5} />
      </instancedMesh>
      {/* çatı: lameller + çevre kirişi */}
      <instancedMesh ref={slats} args={[undefined, undefined, SLATS.length]} raycast={noRaycast}>
        <boxGeometry args={[WIDTH + 0.4, 0.06, 0.22]} />
        <meshBasicMaterial side={THREE.DoubleSide} />
      </instancedMesh>
      <mesh position={[0, UPPER_ROOF_Y - 0.12, FACADE_Z]}>
        <boxGeometry args={[WIDTH + 0.4, 0.24, 0.16]} />
        <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.5} />
      </mesh>

      {/* vantilatörler: göbek + 3 kanat */}
      {UPPER_FANS.map((f) => (
        <mesh key={`${f.x}${f.z}`} position={[f.x, FAN_Y, f.z]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
          <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.5} />
        </mesh>
      ))}
      <instancedMesh ref={blades} args={[undefined, undefined, FAN_BLADES.length]} raycast={noRaycast}>
        <boxGeometry args={[0.9, 0.02, 0.12]} />
        <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.5} />
      </instancedMesh>

      {/* halatlı ahşap avizeler: kiriş + ampuller (ışıktan bağımsız parlak) */}
      {UPPER_CHANDELIERS.map((c) => (
        <mesh key={`${c.x}${c.z}`} position={[c.x, CHANDELIER_Y, c.z]}>
          <boxGeometry args={[1.3, 0.08, 0.1]} />
          <meshStandardMaterial color={SCENE_COLORS.rope} roughness={0.8} />
        </mesh>
      ))}
      <instancedMesh ref={bulbs} args={[undefined, undefined, BULBS.length]} raycast={noRaycast}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <meshBasicMaterial color={SCENE_COLORS.bulb} toneMapped={false} />
      </instancedMesh>

      {/* ısıtıcılar */}
      {HEATERS.map((h) => (
        <mesh key={`${h.x}${h.z}`} position={[h.x, Y0 + 0.95, h.z]}>
          <boxGeometry args={[0.45, 1.9, 0.45]} />
          <meshStandardMaterial color={SCENE_COLORS.lampPole} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Cam panel: iki yönden görünür, hafif mavi, derinlik yazmaz (arkasındaki sahne kesilmez). */
function Glass({
  position,
  size,
  rotY,
}: {
  position: [number, number, number];
  size: [number, number];
  rotY: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotY, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={SCENE_COLORS.glass}
        transparent
        opacity={0.14}
        depthWrite={false}
        side={THREE.DoubleSide}
        roughness={0.1}
      />
    </mesh>
  );
}
