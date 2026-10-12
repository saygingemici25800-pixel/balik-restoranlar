'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { normalizeAngle } from '@/lib/zone/angles';
import { mirrorFor, viewFor } from '@/lib/zone/figure';
import { LEVEL_Y } from '@/lib/zone/frames';
import { buildBodyGeometry } from '@/lib/zone/npc/body';
import { createCrowdMaterial } from '@/lib/zone/npc/crowd-material';
import { CHAR_START, reportSprite, stepWorld, zoneRuntime } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';
import { acquireShadowTexture, releaseShadowTexture } from '@/lib/zone/textures';

/**
 * Terası gezen karakter (docs/zone-3d-modul.md bölüm 6) — 3B gövde, toon. Görünüm kapıda
 * seçilen karaktere göre (`store.hero`): balıkçı (çizgili tişört, bere, sakal) ya da etekli kız.
 *
 * Bu bileşen Zone'un **simülasyon adımını** sürer: `stepWorld()` girdiyi okur, konumu ve iki
 * açıyı günceller. `useFollowCamera` aynı karede yalnızca `cam.ang`'ı kullanır — bu yüzden
 * `<Canvas>` içinde kameradan ÖNCE mount edilir (R3F `useFrame` mount sırasıyla koşar).
 */

const SHADOW_SIZE: [number, number] = [0.95, 0.75];
/** Kahraman kalabalıktan bir tık iri: gözün bulduğu figür. */
const HERO_SCALE = 1.05;

/** Kahraman renkleri: ten, üst, alt, saç/bere (shader `HERO` paleti, bu sırayla). */
const HERO_PALETTE = {
  erkek: ['#e3ad86', '#f4efe6', '#25324f', '#1b2a4a'],
  kiz: ['#f1c9a5', '#f7f2ea', '#d97a3c', '#4a2c1c'],
} as const;

type CharacterProps = { reduced: boolean };

export function Character({ reduced }: CharacterProps) {
  const gl = useThree((s) => s.gl);
  const maxAniso = gl.capabilities.getMaxAnisotropy();
  const kind = useZoneStore((s) => s.hero);

  const hero = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const swing = useRef(0);

  const body = useMemo(
    () => ({
      geometry: buildBodyGeometry('standing', kind),
      material: createCrowdMaterial('hero', HERO_PALETTE[kind], kind === 'kiz'),
    }),
    [kind],
  );
  useEffect(
    () => () => {
      body.geometry.dispose();
      body.material.dispose();
    },
    [body],
  );

  // Sahne kapanınca gölge dokusu bırakılır (bölüm 11).
  useEffect(() => () => releaseShadowTexture(), []);

  useFrame((_, delta) => {
    // Sekme arkaplandayken delta birikir; sıçramayı 50 ms'te keseriz (bölüm 5.1).
    const dt = Math.min(delta, 0.05);
    const { moving, pace } = stepWorld(dt, reduced);

    const mesh = hero.current;
    if (!mesh) return;
    const { char, cam } = zoneRuntime();

    // QA sayaçları (`__ZONE_STATS__`): kameraya göre hangi yönden görünüyor
    const rel = normalizeAngle(char.ang - cam.ang);
    const view = viewFor(rel);
    reportSprite(view, mirrorFor(rel, view), 'drawn', rel);

    /* ---- yön, konum, adım ---- */
    const floorY = LEVEL_Y[char.level];
    mesh.rotation.set(0, char.ang, 0);
    // sprite merkezine göre tutulan sekme (char.y) gövdede yarım: ayaklar yerden kopmasın
    mesh.position.set(char.x, floorY + (char.y - CHAR_START.y) * 0.45, char.z);
    // adım fazı simülasyondan (char.bob); durunca bacaklar yumuşakça toplanır
    const target = moving && !reduced ? Math.sin(char.bob) * (0.55 + 0.7 * pace) : 0;
    swing.current += (target - swing.current) * (moving ? 1 : Math.min(1, dt * 12));
    body.material.uniforms.uSwing.value = swing.current;

    /* ---- gölge: gölge haritası kapalı, canvas'tan düzlem ---- */
    const sh = shadow.current;
    if (sh) {
      const shMat = sh.material as THREE.MeshBasicMaterial;
      if (!shMat.map) {
        shMat.map = acquireShadowTexture(maxAniso);
        shMat.needsUpdate = true;
      }
      sh.position.set(char.x, floorY + 0.02, char.z);
      sh.scale.setScalar(1 + (char.y - CHAR_START.y) * 0.6);
    }
  });

  return (
    <group>
      <mesh
        ref={hero}
        name="zone-char"
        args={[body.geometry, body.material]}
        position={[CHAR_START.x, 0, CHAR_START.z]}
        scale={HERO_SCALE}
        // poz shader'da: geometri sınırı gerçeği yansıtmaz
        frustumCulled={false}
      />
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[CHAR_START.x, 0.02, CHAR_START.z]}>
        <planeGeometry args={SHADOW_SIZE} />
        <meshBasicMaterial transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
