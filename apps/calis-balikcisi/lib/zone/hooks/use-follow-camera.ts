'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import {
  applyAdaptiveFov,
  CAM_DIST,
  CAM_HEIGHT,
  CAM_LERP,
  CAMERA_BOUNDS,
  getFrame,
  LEVEL_Y,
  LOOK_AHEAD,
  LOOK_HEIGHT,
  POV_LERP,
  povTargets,
} from '@/lib/zone/frames';
import { consumeCameraSnap, zoneRuntime } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';
import { CAMERA_POSTS, type CameraPost } from '@/lib/zone/venue-layout';

/**
 * Yön takipli 3. şahıs kamera (docs/zone-3d-modul.md bölüm 5.1). MANCH'ten; farklar:
 *  - iki kat: yükseklik, sınırlar ve engeller karakterin bulunduğu kata göre,
 *  - kamera hedefi ve gerçek konumu dikey engellerin (`CAMERA_POSTS`: şemsiye direği, ficus,
 *    baca) etrafındaki dairenin dışına itilir — near plane'de kesilmez (Faz 2 incelemesi),
 *  - kamera sınıra kırpılıp karaktere `CAM_DIST`'ten yakın kalırsa bakış karaktere kayar
 *    (Faz 1 incelemesi); kırpılmadıkça bakış MANCH ile aynı,
 *  - katlar arası geçişte (`consumeCameraSnap`) ve reduced-motion'da POV'dan çıkışta lerp yok.
 *
 * Kamera **yürünen yönün arkasında durur, önüne bakar.** Açı `stepWorld()` içinde döner; bu hook
 * o açıyı kamera konumuna çevirir.
 *
 * POV (bölüm 5.3): kamera panonun karşısına süzülür. `cam.ang` DEĞİŞMEZ — çıkınca bıraktığı açıdan
 * takibe devam eder. İki dal da O ANKİ konumdan lerp eder; yarım geçişte Esc sıçratmaz.
 * reduced-motion: POV'a giriş ve çıkış anında.
 */

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/** Kare başına Vector3 üretmemek için tek çalışma nesnesi (Zone tekil). */
const target = new THREE.Vector3();

/** Kırpılan kamerada bakışın karaktere kayma hızı: mesafe %55'e inince tamamen karaktere. */
const CLAMP_LOOK_GAIN = 1.8;
/** Karaktere bakarken hedef yükseklik: sprite'ın ortası (kat zemininden). */
const CHAR_CENTER_Y = 0.83;
/**
 * Hedef engelin `r + 0.13` dışına itilir (yumuşak dönüş payı); gerçek konum `r` dışına (sert sınır).
 * Kamera hedefi `CAM_LERP` ile ~0.8 m geriden izler; yalnız hedefi itmek yetmiyordu (ölçüldü: 0.07).
 */
const SOFT_PAD = 0.13;

/** Noktayı dairelerin dışına iter. Nokta tam merkezdeyse karakterden uzağa (kadraj korunur). */
function avoidPosts(
  posts: readonly CameraPost[],
  cx: number,
  cz: number,
  charX: number,
  charZ: number,
  pad: number,
): [number, number] {
  let x = cx;
  let z = cz;
  for (const p of posts) {
    const radius = p.r + pad;
    let dx = x - p.x;
    let dz = z - p.z;
    let d = Math.hypot(dx, dz);
    if (d >= radius) continue;
    if (d < 1e-4) {
      dx = x - charX;
      dz = z - charZ;
      d = Math.hypot(dx, dz);
      if (d < 1e-4) {
        dx = 0;
        dz = 1;
        d = 1;
      }
    }
    x = p.x + (dx / d) * radius;
    z = p.z + (dz / d) * radius;
  }
  return [x, z];
}

export function useFollowCamera(reduced: boolean) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  /** Önceki kare POV'daydı: reduced-motion'da POV'dan çıkış da kaymadan, anında olur. */
  const wasPov = useRef(false);

  /**
   * Ekran oranı değişince dikey FOV yeniden türetilir (bölüm 5.2). R3F `aspect`'i kendisi
   * günceller, `fov`'u güncellemez.
   */
  useEffect(() => {
    applyAdaptiveFov(camera as THREE.PerspectiveCamera, size.width, size.height);
  }, [camera, size]);

  useFrame(() => {
    // Dev/QA: sinema kamerası (hero videosu çekimi) — production'da derlemeden düşer.
    if (process.env.NODE_ENV !== 'production') {
      const cine = (window as unknown as { __ZONE_CINEMA_CAM__?: { p: number[]; t: number[]; fov?: number } })
        .__ZONE_CINEMA_CAM__;
      if (cine) {
        camera.position.set(cine.p[0] ?? 0, cine.p[1] ?? 0, cine.p[2] ?? 0);
        camera.lookAt(cine.t[0] ?? 0, cine.t[1] ?? 0, cine.t[2] ?? 0);
        if (cine.fov) {
          const pc = camera as THREE.PerspectiveCamera;
          if (pc.fov !== cine.fov) {
            pc.fov = cine.fov;
            pc.updateProjectionMatrix();
          }
        }
        return;
      }
    }
    const { char, cam } = zoneRuntime();
    const floorY = LEVEL_Y[char.level];

    const zone = useZoneStore.getState();
    const povFrame = zone.state === 'pov' && zone.pov ? getFrame(zone.pov) : null;
    if (povFrame) {
      const { camTarget, lookTarget } = povTargets(povFrame);
      target.set(camTarget[0], camTarget[1], camTarget[2]);
      if (reduced) camera.position.copy(target);
      else camera.position.lerp(target, POV_LERP);
      camera.lookAt(lookTarget[0], lookTarget[1], lookTarget[2]);
      wasPov.current = true;
      return;
    }
    const snap = consumeCameraSnap() || (reduced && wasPov.current);
    wasPov.current = false;

    const fx = Math.sin(cam.ang);
    const fz = Math.cos(cam.ang);
    const bounds = CAMERA_BOUNDS[char.level];
    const posts = CAMERA_POSTS[char.level];

    // Kamera bulunulan katın sınırını aşmaz; dikey engellerin dışında kalır.
    const [px, pz] = avoidPosts(posts, char.x - fx * CAM_DIST, char.z - fz * CAM_DIST, char.x, char.z, SOFT_PAD);
    const cx = clamp(px, bounds.xMin, bounds.xMax);
    const cz = clamp(pz, bounds.zMin, bounds.zMax);

    target.set(cx, floorY + CAM_HEIGHT, cz);
    if (snap) camera.position.copy(target);
    else camera.position.lerp(target, CAM_LERP);
    const [hx, hz] = avoidPosts(posts, camera.position.x, camera.position.z, char.x, char.z, 0);
    camera.position.x = hx;
    camera.position.z = hz;

    // Bakış noktası karakterin ÖNÜ — karakter kadrajın altında kalır, mekân görünür.
    // Kamera kırpıldıysa (mesafe < CAM_DIST) bakış karaktere kayar; kırpılmadıysa t = 0.
    const dist = Math.hypot(cx - char.x, cz - char.z);
    const t = Math.min(1, Math.max(0, 1 - dist / CAM_DIST) * CLAMP_LOOK_GAIN);
    const ahead = LOOK_AHEAD * (1 - t);
    camera.lookAt(
      char.x + fx * ahead,
      floorY + LOOK_HEIGHT + (CHAR_CENTER_Y - LOOK_HEIGHT) * t,
      char.z + fz * ahead,
    );
  });
}
