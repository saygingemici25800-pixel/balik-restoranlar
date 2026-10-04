'use client';

import { useFrame } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import type * as THREE from 'three';

import { FACADE_Z, SCENE_COLORS, WINE_CELLAR } from '@/lib/zone/frames';
import { m4, noRaycast, useInstances } from '@/lib/zone/instancing';
import { zoneRuntime } from '@/lib/zone/runtime';

/**
 * Açık şarap kavı: cephe camının hemen içinde, vitrinin önünde boylu boyunca meşe raf. Beş bölme,
 * yedi kat; şişeler yatık, boyunları salona (+z) bakar, arkası açık (dışarıdan şişe dipleri
 * görünür). Üst tahtanın altında sıcak ışık şeridi. Dekor: tıklanmaz.
 *
 * Camın hemen içinde ve boylu: kamera terastayken (cephenin öbür yanında) karakteri ve vitrini
 * kapatırdı. Cephe duvarıyla AYNI kural: kamera ile karakter cephenin farklı taraflarındaysa kav
 * soluklaşır ve derinlik yazmaz.
 */
const FADED = 0.22;

const { x0, x1, z0, z1, h } = WINE_CELLAR;
const LEN = x1 - x0;
const DEPTH = z1 - z0;
const MID_X = (x0 + x1) / 2;
const MID_Z = (z0 + z1) / 2;
const BOARD = 0.04;
const BAYS = 5;
const BAY_W = (LEN - (BAYS + 1) * BOARD) / BAYS;
const PLINTH = 0.1;
const ROWS = 7;
const ROW_H = 0.25;
const SHELF_T = 0.025;
const TOP_T = 0.05;

/** Dikey bölmeler (iki uç dahil) ve raf tahtaları. */
const BOARDS = [
  ...Array.from({ length: BAYS + 1 }, (_, i) =>
    m4([x0 + BOARD / 2 + i * (BAY_W + BOARD), h / 2, MID_Z], [0, 0, 0], [BOARD, h, DEPTH]),
  ),
  ...Array.from({ length: ROWS }, (_, r) =>
    m4([MID_X, PLINTH + r * ROW_H + SHELF_T / 2, MID_Z], [0, 0, 0], [LEN, SHELF_T, DEPTH]),
  ),
];

const R = 0.036;
const BODY_L = 0.22;
const BODY_Z = z0 + 0.04 + BODY_L / 2;
const NECK_Z = z0 + 0.04 + BODY_L + 0.04;
const CAP_Z = z0 + 0.04 + BODY_L + 0.095;
const BODY_COLORS = [SCENE_COLORS.wine, SCENE_COLORS.bottle, SCENE_COLORS.wine, SCENE_COLORS.frame];
const CAP_COLORS = [SCENE_COLORS.foil, SCENE_COLORS.wine, SCENE_COLORS.frame, SCENE_COLORS.clothWhite];

type Bottle = { x: number; y: number; k: number };
/** Her bölmede iki kat: altta 5 şişe, üstte aralara oturan 4 şişe. Renk sırası sabit (rastgele değil). */
const BOTTLES: Bottle[] = [];
for (let b = 0; b < BAYS; b++) {
  const left = x0 + BOARD + b * (BAY_W + BOARD);
  const n = Math.floor(BAY_W / (2 * R + 0.012));
  const gap = BAY_W / n;
  for (let r = 0; r < ROWS; r++) {
    const y0 = PLINTH + r * ROW_H + SHELF_T + R;
    for (let i = 0; i < n; i++) BOTTLES.push({ x: left + gap * (i + 0.5), y: y0, k: b * 7 + r * 3 + i });
    for (let i = 0; i < n - 1; i++) BOTTLES.push({ x: left + gap * (i + 1), y: y0 + R * 1.75, k: b * 5 + r * 2 + i + 1 });
  }
}
const ALONG_Z: [number, number, number] = [Math.PI / 2, 0, 0];
const BODIES = BOTTLES.map((b) => m4([b.x, b.y, BODY_Z], ALONG_Z));
const NECKS = BOTTLES.map((b) => m4([b.x, b.y, NECK_Z], ALONG_Z));
const CAPS = BOTTLES.map((b) => m4([b.x, b.y, CAP_Z], ALONG_Z));
const BODY_COLS = BOTTLES.map((b) => BODY_COLORS[b.k % BODY_COLORS.length] ?? SCENE_COLORS.wine);
const CAP_COLS = BOTTLES.map((b) => CAP_COLORS[(b.k * 3 + 1) % CAP_COLORS.length] ?? SCENE_COLORS.foil);

export function WineCellar() {
  const mats = useRef<THREE.Material[]>([]);
  const keep = useCallback((m: THREE.Material | null) => {
    if (m && !mats.current.includes(m)) mats.current.push(m);
  }, []);
  useFrame(({ camera }, delta) => {
    const { char } = zoneRuntime();
    const across = char.level === 0 && (camera.position.z < FACADE_Z) !== (char.z < FACADE_Z);
    const target = across ? FADED : 1;
    for (const m of mats.current) {
      if (m.opacity === target) continue;
      const o = m.opacity + (target - m.opacity) * Math.min(1, Math.min(delta, 0.05) * 8);
      m.opacity = Math.abs(o - target) < 0.005 ? target : o;
      m.depthWrite = m.opacity > 0.98;
      // tam opakken opak geçişte çizilir (saydam geçişte cam/billboard sıralaması şişeleri siler);
      // yalnız soluklaşırken saydam — iki program da önbellekte kalır
      const transparent = m.opacity < 1;
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.needsUpdate = true;
      }
    }
  });

  const boards = useRef<THREE.InstancedMesh>(null);
  const bodies = useRef<THREE.InstancedMesh>(null);
  const necks = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  useInstances(boards, BOARDS);
  useInstances(bodies, BODIES, BODY_COLS);
  useInstances(necks, NECKS, BODY_COLS);
  useInstances(caps, CAPS, CAP_COLS);

  return (
    <group name="zone-wine-cellar">
      {/* süpürgelik + üst tahta */}
      <mesh position={[MID_X, PLINTH / 2, MID_Z]} raycast={noRaycast}>
        <boxGeometry args={[LEN, PLINTH, DEPTH]} />
        <meshStandardMaterial ref={keep} color={SCENE_COLORS.oakSeam} roughness={0.8} />
      </mesh>
      <mesh position={[MID_X, h - TOP_T / 2, MID_Z]} raycast={noRaycast}>
        <boxGeometry args={[LEN + 0.06, TOP_T, DEPTH + 0.04]} />
        <meshStandardMaterial ref={keep} color={SCENE_COLORS.oak} roughness={0.7} />
      </mesh>
      <instancedMesh ref={boards} args={[undefined, undefined, BOARDS.length]} raycast={noRaycast}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={keep} color={SCENE_COLORS.oak} roughness={0.7} />
      </instancedMesh>
      {/* sıcak ışık şeridi: üst tahtanın altı, ön kenar */}
      <mesh position={[MID_X, h - TOP_T - 0.012, z1 - 0.03]} raycast={noRaycast}>
        <boxGeometry args={[LEN - 2 * BOARD, 0.018, 0.03]} />
        <meshBasicMaterial ref={keep} color={SCENE_COLORS.bulb} toneMapped={false} />
      </mesh>
      <instancedMesh ref={bodies} args={[undefined, undefined, BODIES.length]} raycast={noRaycast}>
        <cylinderGeometry args={[R, R, BODY_L, 8]} />
        <meshStandardMaterial ref={keep} roughness={0.25} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={necks} args={[undefined, undefined, NECKS.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.013, R * 0.8, 0.07, 6]} />
        <meshStandardMaterial ref={keep} roughness={0.25} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, CAPS.length]} raycast={noRaycast}>
        <cylinderGeometry args={[0.015, 0.015, 0.045, 6]} />
        <meshStandardMaterial ref={keep} roughness={0.4} metalness={0.3} />
      </instancedMesh>
    </group>
  );
}
