'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { readBrand } from '@/lib/zone/brand';
import {
  BACK_Z,
  BORDER_Z,
  FACADE_DOORS,
  FACADE_Z,
  GROUND_CEIL,
  HALF_W,
  LEVEL_Y,
  SCENE_COLORS,
  STAIR_DOOR_Z,
} from '@/lib/zone/frames';
import { useFontEpoch } from '@/lib/zone/hooks/use-font-epoch';
import { zoneRuntime } from '@/lib/zone/runtime';
import {
  acquireTexture,
  facadeGlassTexture,
  facadeTexture,
  signBandTexture,
  tileTexture,
  wallTexture,
} from '@/lib/zone/textures';

/**
 * Zemin kat kabuğu (videodan): dış teras zemini (koyu gri karo), iç mekân zemini (açık gri büyük
 * karo), çift yüzlü cam cephe (kemerli pencereler, açık sürgü kapılar), üstünde balık logolu mavi
 * tabela bandı, tavan, iç duvarlar (+x uçta merdiven kapısı), dış terasın uç duvarları.
 *
 * İç duvarlar yalnız İÇERİ bakar: kamera duvarın dışına düşünce mekânı kapatmaz ("kesit").
 * Cephe iki yönlü olduğu için kesit kuralı ona işlemez: kamera ile karakter cephenin FARKLI
 * taraflarındaysa (zemin kat) duvar soluklaşır, derinlik yazmaz — karakter duvarın arkasında
 * kaybolmaz. Cam ayrı düzlemde ve hiç derinlik yazmaz.
 */

const WIDTH = HALF_W * 2;
const OUT_Z0 = BORDER_Z - 0.4;
const OUT_LEN = FACADE_Z - OUT_Z0;
const IN_LEN = BACK_Z - FACADE_Z;
const IN_MID = (BACK_Z + FACADE_Z) / 2;
const BAND_H = LEVEL_Y[1] - GROUND_CEIL;
/** Karşı taraftayken cephe duvarının opaklığı; `alphaTest` onunla ölçeklenir (pencereler yine kesilir). */
const FADED = 0.22;

export function GroundFloor() {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const brand = readBrand();
  const epoch = useFontEpoch();

  const outTile = acquireTexture('outTile', String(aniso), () =>
    tileTexture('outTile', SCENE_COLORS.outdoorTile, SCENE_COLORS.outdoorSeam, aniso, [WIDTH / 0.6, OUT_LEN / 0.6]),
  );
  const inTile = acquireTexture('inTile', String(aniso), () =>
    tileTexture('inTile', SCENE_COLORS.indoorTile, SCENE_COLORS.indoorSeam, aniso, [WIDTH / 0.9, IN_LEN / 0.9]),
  );
  const wall = acquireTexture('wall', String(aniso), () => wallTexture(aniso));
  const facade = acquireTexture('facade', '0', () => facadeTexture(FACADE_DOORS, WIDTH, GROUND_CEIL));
  const glass = acquireTexture('facadeGlass', '0', () => facadeGlassTexture(FACADE_DOORS, WIDTH, GROUND_CEIL));
  const facadeMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ camera }, delta) => {
    const m = facadeMat.current;
    if (!m) return;
    const { char } = zoneRuntime();
    const across = char.level === 0 && (camera.position.z < FACADE_Z) !== (char.z < FACADE_Z);
    const target = across ? FADED : 1;
    const o = m.opacity + (target - m.opacity) * Math.min(1, Math.min(delta, 0.05) * 8);
    m.opacity = Math.abs(o - target) < 0.005 ? target : o;
    // alphaTest > 0 kalır (shader yeniden derlenmez); pencere/kapı (alfa 0) her opaklıkta kesilir.
    m.alphaTest = m.opacity * 0.5;
    m.depthWrite = m.opacity > 0.98;
  });
  const sign = acquireTexture('signBand', `${epoch}|${brand.displayFont}`, () => signBandTexture(brand, WIDTH, epoch));

  return (
    <group name="zone-ground">
      {/* zeminler */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, OUT_Z0 + OUT_LEN / 2]}>
        <planeGeometry args={[WIDTH, OUT_LEN]} />
        <meshStandardMaterial map={outTile} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, IN_MID]}>
        <planeGeometry args={[WIDTH, IN_LEN]} />
        <meshStandardMaterial map={inTile} roughness={0.6} />
      </mesh>

      {/* cephe duvarı: iki yönden görünür; pencere ve kapılar saydam (alphaTest ile hiç çizilmez) */}
      <mesh name="zone-facade" position={[0, GROUND_CEIL / 2, FACADE_Z]}>
        <planeGeometry args={[WIDTH, GROUND_CEIL]} />
        <meshStandardMaterial
          ref={facadeMat}
          map={facade}
          transparent
          alphaTest={0.5}
          side={THREE.DoubleSide}
          roughness={0.5}
        />
      </mesh>
      {/* kemerli camlar: derinlik yazmaz → arkasındaki karakter kesilmez */}
      <mesh position={[0, GROUND_CEIL / 2, FACADE_Z + 0.01]}>
        <planeGeometry args={[WIDTH, GROUND_CEIL]} />
        <meshStandardMaterial map={glass} transparent depthWrite={false} side={THREE.DoubleSide} roughness={0.1} />
      </mesh>
      {/* tabela bandı: zemin kat tavanı ile üst kat zemini arası, denize bakar */}
      <mesh position={[0, GROUND_CEIL + BAND_H / 2, FACADE_Z - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[WIDTH, BAND_H]} />
        <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.7} />
      </mesh>

      {/* döşeme arka bandı: üst kattan arka duvarın dışına çıkan kamera döşeme boşluğunu görmesin */}
      <mesh position={[0, GROUND_CEIL + BAND_H / 2, BACK_Z]}>
        <planeGeometry args={[WIDTH, BAND_H]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
      </mesh>

      {/* tavan: ışıktan bağımsız (standard materyal aşağı bakan yüzü gri gösterir — bölüm 13) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, GROUND_CEIL - 0.01, IN_MID]}>
        <planeGeometry args={[WIDTH, IN_LEN]} />
        <meshBasicMaterial color={SCENE_COLORS.ceiling} toneMapped={false} />
      </mesh>

      {/* arka duvar ve −x uç duvarı: içeri bakar */}
      <mesh position={[0, GROUND_CEIL / 2, BACK_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[WIDTH, GROUND_CEIL]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      <mesh position={[-HALF_W, GROUND_CEIL / 2, IN_MID]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[IN_LEN, GROUND_CEIL]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      <EndWallWithStairDoor wall={wall} />

      {/* dış terasın uç duvarları: alçak, beyaz, iki yönden */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (HALF_W + 0.1), 0.45, OUT_Z0 + OUT_LEN / 2]}>
          <boxGeometry args={[0.2, 0.9, OUT_LEN]} />
          <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/** +x uç duvarı (reyonun arkası): vitrinin hemen yanında merdivene çıkan kapı açıklığı. */
function EndWallWithStairDoor({ wall }: { wall: THREE.Texture }) {
  const [d0, d1] = STAIR_DOOR_Z;
  const doorH = 2.4;
  const segs: [number, number][] = [
    [FACADE_Z, d0],
    [d1, BACK_Z],
  ];
  return (
    <group>
      {segs.map(([a, b]) => (
        <mesh key={a} position={[HALF_W, GROUND_CEIL / 2, (a + b) / 2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[b - a, GROUND_CEIL]} />
          <meshStandardMaterial map={wall} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[HALF_W, (doorH + GROUND_CEIL) / 2, (d0 + d1) / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d1 - d0, GROUND_CEIL - doorH]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      {/* kapı kasası: iki pervaz + üst kasa */}
      {[d0, d1].map((z) => (
        <mesh key={z} position={[HALF_W - 0.03, doorH / 2, z]}>
          <boxGeometry args={[0.08, doorH, 0.08]} />
          <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[HALF_W - 0.03, doorH, (d0 + d1) / 2]}>
        <boxGeometry args={[0.08, 0.08, d1 - d0 + 0.08]} />
        <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.6} />
      </mesh>
    </group>
  );
}
