'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { angLerp, normalizeAngle, smoothing } from '@/lib/zone/angles';
import { mirrorFor, viewFor } from '@/lib/zone/figure';
import {
  CAM_DIST,
  CAM_HEIGHT,
  CAMERA_BOUNDS,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  FOG_FAR,
  FOG_NEAR,
  SCENE_COLORS,
  SUN_AZIMUTH,
} from '@/lib/zone/frames';
import { useFollowCamera } from '@/lib/zone/hooks/use-follow-camera';
import { useReducedMotion } from '@/lib/zone/hooks/use-reduced-motion';
import { useZoneControls } from '@/lib/zone/hooks/use-zone-controls';
import {
  CAM_START_ANG,
  CHAR_START,
  resetRuntime,
  resetZoneDebug,
  teleport,
  travelTo,
  zoneRuntime,
} from '@/lib/zone/runtime';
import { releaseTextureSlots, textureLedger } from '@/lib/zone/textures';
import { artSources, releaseArts } from '@/lib/zone/art';
import { useZoneStore } from '@/lib/zone/store';
import { chatLog } from '@/lib/zone/npc/chatter-pref';
import { crowdStats } from '@/lib/zone/npc/crowd-stats';
import { pickCrowdTier } from '@/lib/zone/npc/roster';
import { Character } from './character';
import { ChatterToggle } from './chatter-toggle';
import { Crowd } from './crowd';
import { FrameBoard } from './frame-board';
import { FramePrompt } from './frame-prompt';
import { Joystick } from './joystick';
import { Panels } from './panels';
import { Backdrop } from './backdrop';
import { Greenery } from './greenery';
import { GroundFloor } from './ground-floor';
import { LevelTransition } from './level-transition';
import { Promenade } from './promenade';
import { Reyon } from './reyon';
import { Stairs } from './stairs';
import { Tables } from './tables';
import { Umbrellas } from './umbrellas';
import { UpperFloor } from './upper-floor';

/**
 * Zone sahnesinin kabı (docs/zone-3d-modul.md bölüm 2, 5, 11).
 *
 * **Asla sunucuda render edilmez** — çağıran taraf `next/dynamic` + `{ ssr: false }` kullanır.
 * Dispose disiplini baştan kurulu: unmount'ta renderer, geometry/material ve elle üretilen
 * tüm canvas dokuları bırakılır. Ölçüt: aç-kapa-aç'ta canlı doku sayısı sabit, kapalıyken 0.
 */

export type ZoneCanvasProps = {
  className?: string;
  /** Sahne GERÇEKTEN kurulunca (ilk kareden önce) çağrılır — yükleyici sahte sayaç değil. */
  onReady?: () => void;
};

/** Dev/QA: canlı WebGL bağlamı sayacı — sızıntı testi bunu okur. */
const stats = { created: 0, disposed: 0 };
let liveScene: THREE.Scene | null = null;
let liveCamera: THREE.Camera | null = null;
let liveGl: THREE.WebGLRenderer | null = null;

/** İlk kare doğru kadrajla açılsın: kamera zaten takip konumunda başlar (sınıra kırpılmış). */
const START_CAM: [number, number, number] = [
  CHAR_START.x - Math.sin(CAM_START_ANG) * CAM_DIST,
  CAM_HEIGHT,
  Math.min(CHAR_START.z - Math.cos(CAM_START_ANG) * CAM_DIST, CAMERA_BOUNDS[CHAR_START.level].zMax),
];

/** Gün batımı ışığı güneş yönünden gelir; soğuk dolgu kara tarafından. */
const SUN_LIGHT_POS: [number, number, number] = [SUN_AZIMUTH * 40, 9, -40];

function disposeScene(scene: THREE.Scene) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      // Materyalin taşıdığı tüm doku slotları (map, emissiveMap…)
      for (const value of Object.values(m as unknown as Record<string, unknown>)) {
        if (value && typeof value === 'object' && (value as THREE.Texture).isTexture) {
          (value as THREE.Texture).dispose();
        }
      }
      m.dispose();
    }
  });
  scene.clear();
}

export function ZoneCanvas({ className, onReady }: ZoneCanvasProps) {
  const reduced = useReducedMotion();
  const npcTier = useMemo(() => pickCrowdTier(), []);

  // Kontroller `<Canvas>` DIŞINDA bağlanır: pencere olayları sahneye ait değil.
  useZoneControls();

  // Dev sayaçları — yalnız development'ta (prod'da tree-shake).
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const w = window as unknown as Record<string, unknown>;
    w.__ZONE_ANG__ = { angLerp, normalizeAngle, smoothing, viewFor, mirrorFor };
    w.__ZONE_DEBUG_RESET__ = resetZoneDebug;
    w.__ZONE_TELEPORT__ = teleport;
    // Dev/QA: belirli kat + konum + bakış yönüne anında geç (kamera kaymadan yerine oturur).
    w.__ZONE_TRAVEL__ = travelTo;
    w.__ZONE_SCENE__ = () => liveScene;
    w.__ZONE_STATS__ = () => {
      const rt = zoneRuntime();
      let meshes = 0;
      liveScene?.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) meshes += 1;
      });
      return {
        created: stats.created,
        disposed: stats.disposed,
        /** 0 olmalı: her mount kendi bağlamını unmount'ta bırakır. */
        alive: stats.created - stats.disposed,
        canvases: document.querySelectorAll('canvas').length,
        meshes,
        drawCalls: liveGl?.info.render.calls ?? null,
        textures: textureLedger(),
        char: { x: +rt.char.x.toFixed(3), z: +rt.char.z.toFixed(3), ang: rt.char.ang, level: rt.char.level },
        cam: {
          ang: rt.cam.ang,
          fov: (liveCamera as THREE.PerspectiveCamera | null)?.fov ?? null,
          x: liveCamera ? +liveCamera.position.x.toFixed(3) : null,
          y: liveCamera ? +liveCamera.position.y.toFixed(3) : null,
          z: liveCamera ? +liveCamera.position.z.toFixed(3) : null,
        },
        input: { ...rt.input },
        joy: { ...rt.joy },
        heroRotY: liveScene?.getObjectByName('zone-char')?.rotation.y ?? null,
        peakSpread: rt.debug.peakSpread,
        simTime: rt.debug.simTime,
        seenViews: { ...rt.debug.seenViews },
        view: rt.debug.view,
        mirrored: rt.debug.mirrored,
        spriteSource: rt.debug.source,
        nearFrame: useZoneStore.getState().nearFrame,
        zoneState: useZoneStore.getState().state,
        arts: artSources(),
        npc: crowdStats(),
        chat: { shown: chatLog.shown, active: [...chatLog.active] },
      };
    };
    return () => {
      delete w.__ZONE_STATS__;
      delete w.__ZONE_ANG__;
      delete w.__ZONE_DEBUG_RESET__;
      delete w.__ZONE_TELEPORT__;
      delete w.__ZONE_TRAVEL__;
      delete w.__ZONE_SCENE__;
    };
  }, []);

  return (
    <div className={`relative ${className ?? ''}`}>
      <Canvas
        // Retina'da 2 ile sınırla, yoksa mobilde fps düşer (bölüm 11).
        dpr={typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio, 2)}
        camera={{ fov: CAMERA_FOV, position: START_CAM, near: CAMERA_NEAR, far: CAMERA_FAR }}
        // Gölge haritası KAPALI — karakterin altında canvas'tan yumuşak gölge var.
        shadows={false}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene, camera }) => {
          stats.created += 1;
          // Sahne her kurulduğunda dünya sıfırlanır: aç-kapa-aç aynı yerden başlar.
          resetRuntime();
          gl.setClearColor(SCENE_COLORS.horizon);
          // Zemin halkaları kat zeminine kırpılır (floor-marker `clippingPlanes`).
          gl.localClippingEnabled = true;
          // Fog rengi = ufuk rengi: deniz kenarı ufukta erir (bölüm 4 kararı).
          scene.fog = new THREE.Fog(SCENE_COLORS.horizon, FOG_NEAR, FOG_FAR);
          liveCamera = camera;
          liveGl = gl;
          camera.lookAt(CHAR_START.x, 1.55, CHAR_START.z - CAM_DIST);
          onReady?.();
        }}
      >
        <hemisphereLight args={[SCENE_COLORS.hemiSky, SCENE_COLORS.hemiGround, 0.9]} />
        <ambientLight intensity={0.25} />
        <directionalLight color={SCENE_COLORS.sunLight} intensity={1.5} position={SUN_LIGHT_POS} />
        <directionalLight color={SCENE_COLORS.fillLight} intensity={0.35} position={[8, 10, 24]} />

        <Backdrop reduced={reduced} />
        {/* Mekân (videodan): zemin kat + reyon, dış merdiven, üst kat teras */}
        <GroundFloor />
        <Reyon />
        <Stairs />
        <UpperFloor />
        {/* Dekor: yalnız görsel — tıklanmaz, raycast'e girmez */}
        <Tables />
        {/* Kurgusal misafirler + sofraları (dekor; isimsiz, personel yok) */}
        <Crowd reduced={reduced} />
        <Umbrellas />
        <Greenery />
        <Promenade />
        {/* Panolar + merdiven geçitleri + halkalar + yakınlık, prompt (drei/<Html> — DOM) */}
        <Panels reduced={reduced} />
        <FramePrompt />
        {/* Sıra önemli: `Character` simülasyon adımıdır (girdi → konum → İKİ açı),
            `FollowCamera` yalnızca o açıyı kamera konumuna çevirir. */}
        <Character reduced={reduced} />
        <FollowCamera reduced={reduced} />
        <SceneDisposer
          onDispose={() => {
            stats.disposed += 1;
            liveCamera = null;
            liveGl = null;
          }}
        />
      </Canvas>
      {/* Joystick ve pano kartı `<Canvas>` DIŞINDA: işaretçi olayları, kaydırma, odak ve klavye
          normal DOM'da doğru çalışır. */}
      <Joystick />
      {/* kendi kendine konuşma balonları açılıp kapanabilir (WCAG 2.2.2) */}
      {npcTier !== 'off' ? <ChatterToggle /> : null}
      <FrameBoard />
      <LevelTransition />
    </div>
  );
}

/**
 * R3F, JSX ile tanımlanan geometry/material'ları unmount'ta bırakır ama elle üretilen canvas
 * dokularını bırakmaz. Bu bileşen sahneyi dolaşıp hepsini bırakır (bölüm 11).
 */
function SceneDisposer({ onDispose }: { onDispose: () => void }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    liveScene = scene;
    return () => {
      disposeScene(scene);
      // Yuvalı dokular sahneye değil yuva kaydına ait — sahne seviyesinde bırakılır.
      // `trackTexture` çift `dispose()`'u bir kez sayar.
      releaseTextureSlots();
      releaseArts();
      if (liveScene === scene) liveScene = null;
      onDispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);
  return null;
}

/** `useFollowCamera` `<Canvas>` içinde çağrılmalı (useThree/useFrame). */
function FollowCamera({ reduced }: { reduced: boolean }) {
  useFollowCamera(reduced);
  return null;
}
