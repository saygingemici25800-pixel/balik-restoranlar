'use client';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import {
  BAY_H,
  BAY_RADIUS,
  BAY_Y,
  MOUNTAIN_H,
  MOUNTAIN_RADIUS,
  MOUNTAIN_Y,
  ROAD_Z_MAX,
  ROAD_Z_MIN,
  SAND_Y,
  SAND_Z_MIN,
  SCENE_COLORS,
  SEA_RADIUS,
  SEA_Y,
  SKY_RADIUS,
  SUN_AZIMUTH,
  SUN_DIST,
  SUN_ELEVATION_Y,
  SUN_SIZE,
} from '@/lib/zone/frames';
import {
  acquireTexture,
  bayTexture,
  glitterTexture,
  mountainTexture,
  roadTexture,
  sandTexture,
  seaTexture,
  skyTexture,
  sunTexture,
} from '@/lib/zone/textures';

/**
 * Mekânın dışı: gökyüzü, dağlar, güneş, deniz, kum, sahil yolu, kara.
 *
 * **Kamera dönünce boşluk görünmemesi** — kapalı salondaki "ön duvar şart" dersinin açık
 * hava karşılığı:
 *  1. Gökyüzü kubbesi (BackSide küre) her yönü kaplar; `scene.background` hiç görünmez.
 *  2. Deniz dairesi ufka kadar uzanır; fog rengi = ufuk rengi → kenar keskin değil, erir.
 *  3. Kara tarafları kapalı (venue-shell: yan çalı/duvar, arka duvar), üstlerinde dağ silueti.
 *  4. Kamera mekân sınırına kırpılır (`use-follow-camera`).
 */

const SUN_DIR = new THREE.Vector3(SUN_AZIMUTH, 0, -1).normalize();
const SUN_POS: [number, number, number] = [SUN_DIR.x * SUN_DIST, SUN_ELEVATION_Y, SUN_DIR.z * SUN_DIST];
/** Düzlemin normali (+z) orijine baksın. */
const SUN_ROT_Y = Math.atan2(-SUN_POS[0], -SUN_POS[2]);

/** Parıltı yolu kıyıdan güneşe doğru uzanır. */
const GLITTER_LEN = 140;
const GLITTER_W = 22;
const GLITTER_START = Math.abs(SAND_Z_MIN) + 2;

/** Kara ve kum ufka kadar uzanır; fog uzak ucu ufuk rengine eritir. */
const LAND_FAR = 160;
const WIDE = 340;

/** Dağ şeridi kara tarafını sarar: −x → +z → +x, iki ucu deniz tarafına taşar ve söner. */
const MOUNTAIN_THETA_START = -Math.PI / 2 - 0.55;
const MOUNTAIN_THETA_LEN = Math.PI + 1.1;

/**
 * Körfezin karşı kıyısı: deniz tarafını (θ ≈ π) kara şeridinin bıraktığı yayda kapatır. Silindirde
 * x = r·sinθ, z = r·cosθ; güneşin açısı θ = atan2(sx, sz). Siluet güneşin olduğu yerde alçalır.
 */
const BAY_THETA_START = 2.0;
const BAY_THETA_LEN = 2.28;
const SUN_THETA = Math.atan2(SUN_AZIMUTH, -1) + (Math.atan2(SUN_AZIMUTH, -1) < 0 ? Math.PI * 2 : 0);
const BAY_SUN_U = (SUN_THETA - BAY_THETA_START) / BAY_THETA_LEN;

export function Backdrop({ reduced }: { reduced: boolean }) {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  // `useMemo` değil, doku yuvası: StrictMode çift render'ında sahipsiz doku kalmaz.
  const sky = acquireTexture('sky', '0', () => skyTexture());
  const sun = acquireTexture('sun', '0', () => sunTexture());
  const glitter = acquireTexture('glitter', '0', () => glitterTexture());
  const sea = acquireTexture('sea', String(aniso), () => seaTexture(aniso));
  const sand = acquireTexture('sand', String(aniso), () => sandTexture(aniso));
  const road = acquireTexture('road', String(aniso), () => roadTexture(aniso));
  const mountains = acquireTexture('mountains', '0', () => mountainTexture());
  const bay = acquireTexture('bay', '0', () => bayTexture(BAY_SUN_U));

  /** Deniz yavaşça kayar — reduced-motion'da durur. */
  useFrame((_, delta) => {
    if (reduced) return;
    const dt = Math.min(delta, 0.05);
    sea.offset.x = (sea.offset.x + dt * 0.006) % 1;
    sea.offset.y = (sea.offset.y + dt * 0.003) % 1;
  });

  const sandLen = ROAD_Z_MIN - SAND_Z_MIN;
  const roadLen = ROAD_Z_MAX - ROAD_Z_MIN;
  const landLen = LAND_FAR - ROAD_Z_MAX;

  return (
    <group>
      {/* gökyüzü kubbesi: ilk çizilir, derinlik yazmaz */}
      <mesh renderOrder={-2}>
        <sphereGeometry args={[SKY_RADIUS, 48, 24]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* dağ silueti: sis AÇIK — 120 birimde hava perspektifiyle soluklaşır */}
      <mesh position={[0, MOUNTAIN_Y, 0]} renderOrder={-1}>
        <cylinderGeometry
          args={[MOUNTAIN_RADIUS, MOUNTAIN_RADIUS, MOUNTAIN_H, 72, 1, true, MOUNTAIN_THETA_START, MOUNTAIN_THETA_LEN]}
        />
        <meshBasicMaterial map={mountains} side={THREE.BackSide} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* körfezin karşı kıyısı: sis KAPALI (160'ta sis onu tamamen silerdi), hazır pus renkleri */}
      <mesh position={[0, BAY_Y, 0]} renderOrder={-1}>
        <cylinderGeometry args={[BAY_RADIUS, BAY_RADIUS, BAY_H, 72, 1, true, BAY_THETA_START, BAY_THETA_LEN]} />
        <meshBasicMaterial map={bay} side={THREE.BackSide} transparent depthWrite={false} fog={false} toneMapped={false} />
      </mesh>

      {/* güneş + hale */}
      <mesh position={SUN_POS} rotation={[0, SUN_ROT_Y, 0]}>
        <planeGeometry args={[SUN_SIZE, SUN_SIZE]} />
        <meshBasicMaterial
          map={sun}
          transparent
          blending={THREE.AdditiveBlending}
          fog={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* deniz: ışıktan bağımsız, yansıyan gökyüzü rengi; fog ufukta gökyüzüyle birleştirir */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y, 0]}>
        <circleGeometry args={[SEA_RADIUS, 72]} />
        <meshBasicMaterial map={sea} toneMapped={false} />
      </mesh>

      {/* parıltı yolu: kanvasın üstü güneş tarafı */}
      <group rotation={[0, SUN_ROT_Y, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y + 0.02, -(GLITTER_START + GLITTER_LEN / 2)]}>
          <planeGeometry args={[GLITTER_W, GLITTER_LEN]} />
          <meshBasicMaterial
            map={glitter}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* kum: yoldan denize iner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SAND_Y, (ROAD_Z_MIN + SAND_Z_MIN) / 2]}>
        <planeGeometry args={[WIDE, sandLen]} />
        <meshStandardMaterial map={sand} roughness={1} />
      </mesh>
      {/* yol ile kum arası set */}
      <mesh position={[0, SAND_Y / 2, ROAD_Z_MIN - 0.1]}>
        <boxGeometry args={[WIDE, -SAND_Y, 0.2]} />
        <meshStandardMaterial color={SCENE_COLORS.roadSeam} roughness={1} />
      </mesh>

      {/* sahil yolu */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (ROAD_Z_MIN + ROAD_Z_MAX) / 2]}>
        <planeGeometry args={[WIDE, roadLen]} />
        <meshStandardMaterial map={road} roughness={1} />
      </mesh>

      {/* kara: mekânın yanları ve arkası — yan çalıların ve çatının üstünden görünür */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, ROAD_Z_MAX + landLen / 2]}>
        <planeGeometry args={[WIDE, landLen]} />
        <meshStandardMaterial color={SCENE_COLORS.land} roughness={1} />
      </mesh>
    </group>
  );
}
