'use client';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { CABINET, FACADE_Z, GRILL, GROUND_CEIL, HALF_W, REYON_X, SCENE_COLORS } from '@/lib/zone/frames';
import { noRaycast } from '@/lib/zone/instancing';
import { acquireTexture, cabinetTexture, fabricTexture, hexTileTexture, oakTexture, stripeTexture } from '@/lib/zone/textures';
import { OpenKitchen } from './open-kitchen';
import { WineCellar } from './wine-cellar';

/**
 * Reyon kanadı ve salon tavanı. +x uç duvarına bakınca soldan sağa: cephe camının içinde açık
 * şarap kavı (`wine-cellar`), önünde uç duvara DİK meze + balık vitrini (mavi altıgen karo taban,
 * cam, mavi-beyaz şerit bant; camı kava bakar, arkası personel tarafı), vitrinle kav arasında meşe
 * zemin; vitrinin hemen sağında merdiven kapısı (`ground-floor`), kapının sağında açık mutfak
 * (`open-kitchen`). Salonla reyonun birleştiği yerde közlü ızgara; salon boyunca meşe kiriş ve
 * altında beyaz kumaş dalga askısı.
 */

const CAB_LEN = CABINET.x1 - CABINET.x0;
const CAB_MID = (CABINET.x0 + CABINET.x1) / 2;
const FRONT_Z = CABINET.z - CABINET.depth / 2;
const REAR_Z = CABINET.z + CABINET.depth / 2;
const BASE_H = 0.5;
const DISPLAY_TOP = 1.2;
const BAND_TOP = 1.42;
const DISPLAY_H = DISPLAY_TOP - BASE_H;
const LEDGE_H = 0.95;

/** Kav ile vitrin arasındaki meşe zemin. */
const AISLE_X0 = CABINET.x0 - 0.3;
const AISLE_Z0 = FACADE_Z + 0.15;
const AISLE_W = HALF_W - AISLE_X0;
const AISLE_D = FRONT_Z - AISLE_Z0;

/** Salonun meşe kirişi ve kumaş askısı: x −14.6 … reyon başlangıcı. */
const SOFFIT_X0 = -HALF_W + 0.4;
const SOFFIT_X1 = REYON_X - 0.4;
const SOFFIT_Z = 3.0;

export function Reyon() {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  const hex = acquireTexture('hexTile', String(aniso), () => hexTileTexture(aniso));
  const stripe = acquireTexture('stripe', '0', () => stripeTexture(CAB_LEN / 0.12));
  const content = acquireTexture('cabinet', '0', () => cabinetTexture(CAB_LEN));
  const oak = acquireTexture('oak', `${aniso}:aisle`, () => oakTexture(aniso, [AISLE_W / 1.3, AISLE_D / 1.2]));
  const fabric = acquireTexture('fabric', '0', () => fabricTexture((SOFFIT_X1 - SOFFIT_X0) / 1.2));

  return (
    <group name="zone-reyon">
      {/* vitrin tabanı: mavi altıgen karo */}
      <mesh position={[CAB_MID, BASE_H / 2, CABINET.z]} raycast={noRaycast}>
        <boxGeometry args={[CAB_LEN, BASE_H, CABINET.depth]} />
        <meshStandardMaterial map={hex} roughness={0.35} />
      </mesh>
      {/* buz yatağı + vitrin içi (ışıktan bağımsız: soğutmalı vitrin aydınlık görünür) + cam ön yüz */}
      <mesh position={[CAB_MID, BASE_H + 0.06, CABINET.z - 0.1]} raycast={noRaycast}>
        <boxGeometry args={[CAB_LEN - 0.04, 0.12, CABINET.depth - 0.3]} />
        <meshStandardMaterial color={SCENE_COLORS.ice} roughness={0.3} />
      </mesh>
      <mesh position={[CAB_MID, BASE_H + DISPLAY_H / 2, CABINET.z + 0.15]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CAB_LEN, DISPLAY_H]} />
        {/* çift yüz: personel tarafından da vitrin dolu görünür */}
        <meshBasicMaterial map={content} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[CAB_MID, BASE_H + DISPLAY_H / 2, FRONT_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CAB_LEN, DISPLAY_H]} />
        <meshStandardMaterial color={SCENE_COLORS.glass} transparent opacity={0.18} roughness={0.1} />
      </mesh>
      {/* salona bakan uç: cam yan */}
      <mesh position={[CABINET.x0, BASE_H + DISPLAY_H / 2, CABINET.z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CABINET.depth, DISPLAY_H]} />
        <meshStandardMaterial color={SCENE_COLORS.glass} transparent opacity={0.22} roughness={0.1} />
      </mesh>
      {/* personel tarafı: alçak çelik çalışma tezgâhı (üstünden vitrin görünür) */}
      <mesh position={[CAB_MID, (BASE_H + LEDGE_H) / 2, REAR_Z - 0.13]} raycast={noRaycast}>
        <boxGeometry args={[CAB_LEN, LEDGE_H - BASE_H, 0.26]} />
        <meshStandardMaterial color={SCENE_COLORS.slat} roughness={0.4} metalness={0.12} />
      </mesh>
      {/* üst bant: mavi-beyaz şerit */}
      <mesh position={[CAB_MID, (DISPLAY_TOP + BAND_TOP) / 2, FRONT_Z - 0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CAB_LEN, BAND_TOP - DISPLAY_TOP]} />
        <meshStandardMaterial map={stripe} roughness={0.6} />
      </mesh>
      <mesh position={[CAB_MID, DISPLAY_TOP + 0.01, CABINET.z]}>
        <boxGeometry args={[CAB_LEN, 0.02, CABINET.depth]} />
        <meshStandardMaterial color={SCENE_COLORS.ceiling} roughness={0.3} metalness={0.12} />
      </mesh>

      {/* kav ile vitrin arasındaki meşe zemin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[AISLE_X0 + AISLE_W / 2, 0.004, AISLE_Z0 + AISLE_D / 2]}>
        <planeGeometry args={[AISLE_W, AISLE_D]} />
        <meshStandardMaterial map={oak} roughness={0.7} />
      </mesh>

      <WineCellar />
      <OpenKitchen />
      <Grill />

      {/* salon: meşe kiriş + beyaz kumaş dalga (alt kenar 2.66 — kamera 2.45 altından geçer) */}
      <mesh position={[(SOFFIT_X0 + SOFFIT_X1) / 2, 3.1, SOFFIT_Z]}>
        <boxGeometry args={[SOFFIT_X1 - SOFFIT_X0, 0.2, 0.9]} />
        <meshStandardMaterial color={SCENE_COLORS.oak} roughness={0.7} />
      </mesh>
      <mesh position={[(SOFFIT_X0 + SOFFIT_X1) / 2, 2.83, SOFFIT_Z]}>
        <planeGeometry args={[SOFFIT_X1 - SOFFIT_X0, 0.34]} />
        {/* ışıktan bağımsız: gün batımı ışığında kahverengiye dönmesin, kumaş beyaz okunsun */}
        <meshBasicMaterial map={fabric} transparent alphaTest={0.05} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Közlü ızgara: siyah soba, önünde ateş penceresi, tavana çıkan baca. */
function Grill() {
  return (
    <group position={[GRILL.x, 0, GRILL.z]}>
      <mesh position={[0, GRILL.h / 2, 0]}>
        <boxGeometry args={[GRILL.w, GRILL.h, GRILL.d]} />
        <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, -GRILL.d / 2 - 0.005]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[GRILL.w * 0.6, 0.45]} />
        <meshBasicMaterial color={SCENE_COLORS.fire} toneMapped={false} />
      </mesh>
      <mesh position={[0, (GRILL.h + GROUND_CEIL) / 2, 0]}>
        <cylinderGeometry args={[0.14, 0.14, GROUND_CEIL - GRILL.h, 12]} />
        <meshStandardMaterial color={SCENE_COLORS.steel} roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}
