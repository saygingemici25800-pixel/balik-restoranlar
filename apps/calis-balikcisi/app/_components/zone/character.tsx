'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { normalizeAngle } from '@/lib/zone/angles';
import { acquireCharacterSet, releaseCharacterSet } from '@/lib/zone/character';
import { mirrorFor, viewFor } from '@/lib/zone/figure';
import { LEVEL_Y } from '@/lib/zone/frames';
import { CHAR_START, reportSprite, stepWorld, zoneRuntime } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';
import { acquireShadowTexture, releaseShadowTexture } from '@/lib/zone/textures';

/**
 * Terası gezen karakter (docs/zone-3d-modul.md bölüm 6). MANCH `Character.tsx`'ten; çizim
 * kapıda seçilen karaktere göre (balıkçı ya da etekli kız — `store.hero`).
 *
 * Bu bileşen Zone'un **simülasyon adımını** sürer: `stepWorld()` girdiyi okur, konumu ve iki
 * açıyı günceller. `useFollowCamera` aynı karede yalnızca `cam.ang`'ı kullanır — bu yüzden
 * `<Canvas>` içinde kameradan ÖNCE mount edilir (R3F `useFrame` mount sırasıyla koşar).
 */

const SPRITE_SIZE: [number, number] = [1.3, 1.66];
const SHADOW_SIZE: [number, number] = [1.3, 0.9];

type CharacterProps = { reduced: boolean };

export function Character({ reduced }: CharacterProps) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const maxAniso = gl.capabilities.getMaxAnisotropy();
  const kind = useZoneStore((s) => s.hero);

  const hero = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);

  // Sahne kapanınca sprite seti ve gölge dokusu bırakılır (bölüm 11).
  useEffect(
    () => () => {
      releaseCharacterSet();
      releaseShadowTexture();
    },
    [],
  );

  useFrame((_, delta) => {
    // Sekme arkaplandayken delta birikir; sıçramayı 50 ms'te keseriz (bölüm 5.1).
    const dt = Math.min(delta, 0.05);
    const { lean } = stepWorld(dt, reduced);

    const mesh = hero.current;
    if (!mesh) return;
    const { char, cam } = zoneRuntime();
    const sprite = acquireCharacterSet(maxAniso, kind);

    /* ---- açıya göre sprite + aynalama (bölüm 6.1) ---- */
    const rel = normalizeAngle(char.ang - cam.ang);
    const view = viewFor(rel);
    const mirrored = mirrorFor(rel, view);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    if (mat.map !== sprite[view]) {
      mat.map = sprite[view];
      mat.needsUpdate = true;
    }
    reportSprite(view, mirrored, sprite.source, rel);

    /* ---- billboard (bölüm 6.1) ----
       Düzlem kameraya dönmezse kamera karakterin öbür tarafına geçtiğinde arka yüz kırpılır:
       karakter kaybolur. Yalnız Y ekseninde döndürülür; lean (z) Euler XYZ'de önce uygulanır. */
    mesh.rotation.set(
      0,
      Math.atan2(camera.position.x - char.x, camera.position.z - char.z),
      lean ?? mesh.rotation.z * 0.85,
    );
    const floorY = LEVEL_Y[char.level];
    mesh.position.set(char.x, floorY + char.y, char.z);
    mesh.scale.x = mirrored ? -1 : 1;

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
      <mesh ref={hero} name="zone-char" position={[CHAR_START.x, CHAR_START.y, CHAR_START.z]}>
        <planeGeometry args={SPRITE_SIZE} />
        {/* `alphaTest`: saydam pikseller derinlik yazmaz → görünmez dikdörtgen arkayı kesmez. */}
        <meshBasicMaterial transparent alphaTest={0.05} toneMapped={false} />
      </mesh>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[CHAR_START.x, 0.02, CHAR_START.z]}>
        <planeGeometry args={SHADOW_SIZE} />
        <meshBasicMaterial transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
