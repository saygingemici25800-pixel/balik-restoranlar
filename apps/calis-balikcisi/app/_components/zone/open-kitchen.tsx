'use client';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { BACK_Z, GROUND_CEIL, HALF_W, KITCHEN, SCENE_COLORS } from '@/lib/zone/frames';
import { noRaycast } from '@/lib/zone/instancing';
import { acquireTexture, subwayTexture } from '@/lib/zone/textures';

/**
 * Açık mutfak (uç duvarın sağ yarısı, kapının arkası): duvar boyunca çelik tezgâh, ortada ocak
 * (dört göz, ikisinde tencere) ve üstünde davlumbaz (alt kenar 2.65 — kamera 2.45 altından geçer),
 * arkada metro karo; salona bakan meşe önlü pas
 * tezgâhı, üstünde tabak rafı ve üç ısıtma lambası (alt kenar 2.7 — kamera 2.45 altından geçer);
 * arka duvarda evye tezgâhı. Dekor: tıklanmaz.
 */

const { h: H, wall, range, island, sink } = KITCHEN;
const WALL_D = HALF_W - wall.x0;
const WALL_X = (wall.x0 + HALF_W) / 2;
const WALL_LEN = wall.z1 - wall.z0;
const WALL_MID = (wall.z0 + wall.z1) / 2;
const RANGE_MID = (range.z0 + range.z1) / 2;
const RANGE_LEN = range.z1 - range.z0;
const ISL_X = (island.x0 + island.x1) / 2;
const ISL_D = island.x1 - island.x0;
const ISL_MID = (island.z0 + island.z1) / 2;
const ISL_LEN = island.z1 - island.z0;
const SINK_D = wall.z1 - sink.z0;
const SINK_X = (sink.x0 + sink.x1) / 2;
const SINK_Z = (sink.z0 + wall.z1) / 2;
const TOP = 0.04;
const TILE_TOP = 2.4;
const HOOD_Y0 = 2.65;
const HOOD_Y1 = 2.95;
const PASS_Y = 1.38;
const LAMP_Y = 2.72;

/** Paslanmaz çelik: ortam haritası yok — yüksek metallik koyu kahveye düşer, bu yüzden düşük. */
const STEEL = { color: SCENE_COLORS.slat, roughness: 0.4, metalness: 0.12 } as const;
const STEEL_TOP = { color: SCENE_COLORS.ceiling, roughness: 0.3, metalness: 0.12 } as const;

const BURNERS = [0.3, 0.9].flatMap((dz) => [0.18, 0.48].map((dx) => [wall.x0 + dx, range.z0 + dz] as const));
const POTS = [BURNERS[0], BURNERS[3]].filter((b) => b !== undefined);
const LAMPS = [0.25, 0.5, 0.75].map((t) => island.z0 + ISL_LEN * t);
const PLATES = Array.from({ length: 6 }, (_, i) => island.z0 + 0.3 + i * ((ISL_LEN - 0.6) / 5));

export function OpenKitchen() {
  const aniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const subway = acquireTexture('subway', String(aniso), () => subwayTexture(aniso));

  return (
    <group name="zone-kitchen">
      {/* duvar tezgâhı: çelik gövde + tezgâh, arkada metro karo */}
      <mesh position={[WALL_X, (H - TOP) / 2, WALL_MID]} raycast={noRaycast}>
        <boxGeometry args={[WALL_D, H - TOP, WALL_LEN]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[WALL_X, H - TOP / 2, WALL_MID]} raycast={noRaycast}>
        <boxGeometry args={[WALL_D + 0.02, TOP, WALL_LEN]} />
        <meshStandardMaterial {...STEEL_TOP} />
      </mesh>
      <mesh position={[HALF_W - 0.02, (H + TILE_TOP) / 2, WALL_MID]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[WALL_LEN, TILE_TOP - H]} />
        <meshStandardMaterial map={subway} roughness={0.4} />
      </mesh>

      {/* ocak: siyah yüzey, dört göz, iki tencere; tencerenin altında köz rengi */}
      <mesh position={[WALL_X, H + 0.006, RANGE_MID]} raycast={noRaycast}>
        <boxGeometry args={[WALL_D - 0.06, 0.012, RANGE_LEN]} />
        <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.6} />
      </mesh>
      {BURNERS.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, H + 0.018, z]} raycast={noRaycast}>
          <cylinderGeometry args={[0.1, 0.1, 0.012, 14]} />
          <meshStandardMaterial color={SCENE_COLORS.lampPole} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {POTS.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, H + 0.02, z]}>
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.01, 14]} />
            <meshBasicMaterial color={SCENE_COLORS.fire} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.12, 0.11, 0.2, 14]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        </group>
      ))}

      {/* davlumbaz + tavana çıkan kanal */}
      <mesh position={[WALL_X - 0.02, (HOOD_Y0 + HOOD_Y1) / 2, RANGE_MID]}>
        <boxGeometry args={[WALL_D + 0.06, HOOD_Y1 - HOOD_Y0, RANGE_LEN + 0.4]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[HALF_W - 0.2, (HOOD_Y1 + GROUND_CEIL) / 2, RANGE_MID]}>
        <boxGeometry args={[0.34, GROUND_CEIL - HOOD_Y1, 0.42]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* duvar rafı: ocağın iki yanında, üstünde beyaz tabak yığınları */}
      {[
        [wall.z0 + 0.1, range.z0 - 0.15],
        [range.z1 + 0.15, wall.z1 - 0.1],
      ].map(([a = 0, b = 0]) => (
        <group key={a}>
          <mesh position={[HALF_W - 0.16, 1.7, (a + b) / 2]}>
            <boxGeometry args={[0.3, 0.035, b - a]} />
            <meshStandardMaterial color={SCENE_COLORS.oak} roughness={0.7} />
          </mesh>
          {[0.25, 0.5, 0.75].map((t) => (
            <mesh key={t} position={[HALF_W - 0.16, 1.77, a + (b - a) * t]}>
              <cylinderGeometry args={[0.11, 0.11, 0.1, 14]} />
              <meshStandardMaterial color={SCENE_COLORS.clothWhite} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      <PassCounter />

      {/* arka duvarda evye tezgâhı: çelik gövde, koyu lavabo, musluk */}
      <mesh position={[SINK_X, (H - TOP) / 2, SINK_Z]} raycast={noRaycast}>
        <boxGeometry args={[sink.x1 - sink.x0, H - TOP, SINK_D]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[SINK_X, H - TOP / 2, SINK_Z]} raycast={noRaycast}>
        <boxGeometry args={[sink.x1 - sink.x0, TOP, SINK_D + 0.02]} />
        <meshStandardMaterial {...STEEL_TOP} />
      </mesh>
      <mesh position={[SINK_X, H + 0.002, SINK_Z]} raycast={noRaycast}>
        <boxGeometry args={[0.6, 0.004, 0.4]} />
        <meshStandardMaterial color={SCENE_COLORS.lampPole} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[SINK_X, H + 0.17, BACK_Z - 0.08]}>
        <cylinderGeometry args={[0.015, 0.015, 0.34, 8]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
    </group>
  );
}

/** Salona bakan pas tezgâhı: meşe ön yüz, çelik üst, tabak rafı, üç ısıtma lambası. */
function PassCounter() {
  return (
    <group>
      <mesh position={[ISL_X, (H - TOP) / 2, ISL_MID]} raycast={noRaycast}>
        <boxGeometry args={[ISL_D, H - TOP, ISL_LEN]} />
        <meshStandardMaterial color={SCENE_COLORS.oak} roughness={0.7} />
      </mesh>
      <mesh position={[ISL_X, H - TOP / 2, ISL_MID]} raycast={noRaycast}>
        <boxGeometry args={[ISL_D + 0.06, TOP, ISL_LEN + 0.06]} />
        <meshStandardMaterial {...STEEL_TOP} />
      </mesh>
      {/* pas rafı: iki dikme üstünde, salon tarafında; üstünde tabaklar */}
      {[island.z0 + 0.12, island.z1 - 0.12].map((z) => (
        <mesh key={z} position={[island.x0 + 0.12, (H + PASS_Y) / 2, z]}>
          <boxGeometry args={[0.04, PASS_Y - H, 0.04]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      <mesh position={[island.x0 + 0.2, PASS_Y, ISL_MID]}>
        <boxGeometry args={[0.36, 0.03, ISL_LEN - 0.1]} />
        <meshStandardMaterial {...STEEL_TOP} />
      </mesh>
      {PLATES.map((z) => (
        <mesh key={z} position={[island.x0 + 0.2, PASS_Y + 0.03, z]}>
          <cylinderGeometry args={[0.13, 0.11, 0.03, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.clothWhite} roughness={0.35} />
        </mesh>
      ))}
      {/* ısıtma lambaları: tavandan kablo, sıcak ışıklı başlık */}
      {LAMPS.map((z) => (
        <group key={z} position={[ISL_X - 0.1, 0, z]}>
          <mesh position={[0, (LAMP_Y + 0.16 + GROUND_CEIL) / 2, 0]}>
            <cylinderGeometry args={[0.006, 0.006, GROUND_CEIL - LAMP_Y - 0.16, 4]} />
            <meshStandardMaterial color={SCENE_COLORS.frame} />
          </mesh>
          <mesh position={[0, LAMP_Y + 0.08, 0]}>
            <coneGeometry args={[0.13, 0.16, 14, 1, true]} />
            <meshStandardMaterial color={SCENE_COLORS.frame} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, LAMP_Y + 0.03, 0]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshBasicMaterial color={SCENE_COLORS.fire} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
