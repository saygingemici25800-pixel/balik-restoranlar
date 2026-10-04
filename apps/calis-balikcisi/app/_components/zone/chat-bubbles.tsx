'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { readBrand } from '@/lib/zone/brand';
import { FACADE_Z, LEVEL_Y } from '@/lib/zone/frames';
import { noRaycast } from '@/lib/zone/instancing';
import { BUBBLE_CANVAS, bubbleFont, drawBubble } from '@/lib/zone/npc/bubble';
import {
  bubbleView,
  createDirector,
  directorTick,
  FADE_IN,
  FADE_OUT,
  type Speaker,
  type TickCtx,
} from '@/lib/zone/npc/bubble-director';
import { chatLog, chatterOn } from '@/lib/zone/npc/chatter-pref';
import { zoneRuntime } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';
import { acquireTexture, trackTexture } from '@/lib/zone/textures';

/**
 * Kendi kendine konuşma balonları: canvas dokulu billboard havuzu (DOM yok — ekran okuyucuyu
 * boğmaz). Ekranda sabit boyut, derinlik testi YOK: direk/şemsiye/palmiye yazıyı kesmez (duvar
 * arkasındakiler zaten `visibleZones` ile konuşmaz). Konum, ölçek ve yön `onBeforeRender`'da —
 * kamera o karede güncellendikten sonra. POV ve kat geçişinde balon yok. Yuva dokuları
 * defterde (`npcBubble`), sahne kapanınca bırakılır.
 */

type ChatBubblesProps = { speakers: readonly Speaker[]; slots: number; reduced: boolean };

const ASPECT = BUBBLE_CANVAS.w / BUBBLE_CANVAS.h;
const DEV = process.env.NODE_ENV !== 'production';
const tmpV = new THREE.Vector3();
/** Kalam yüklenemediyse (çevrimdışı) her balonda yeniden denenmez. */
let fontFailed = false;

function bubbleTexture() {
  const c = document.createElement('canvas');
  c.width = BUBBLE_CANVAS.w;
  c.height = BUBBLE_CANVAS.h;
  const t = trackTexture(new THREE.CanvasTexture(c), 'npcBubble');
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter;
  return t;
}

export function ChatBubbles({ speakers, slots, reduced }: ChatBubblesProps) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const brand = useMemo(() => readBrand(), []);
  const director = useMemo(() => createDirector(speakers.length, slots), [speakers, slots]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), []);
  const ctx = useMemo<TickCtx>(
    () => ({ level: 0, inside: false, enabled: true, quiet: false, reduced, hero: { x: 0, y: 0, z: 0 }, view: bubbleView(1, 1), brand }),
    [reduced, brand],
  );

  useFrame(({ camera, size }, delta) => {
    const zone = useZoneStore.getState();
    if (zone.state !== 'zone') {
      // POV/geçiş: balonlar biter (dönüşte eski balon tam opak geri gelmesin)
      director.slots.fill(null);
      for (const m of meshes.current) if (m) m.visible = false;
      return;
    }
    const { char } = zoneRuntime();
    ctx.level = char.level;
    ctx.inside = char.level === 0 && char.z > FACADE_Z;
    ctx.enabled = chatterOn();
    ctx.quiet = !!zone.nearFrame || !!zone.nearPortal;
    ctx.hero.x = char.x;
    ctx.hero.y = LEVEL_Y[char.level];
    ctx.hero.z = char.z;
    if (ctx.view.w !== size.width || ctx.view.h !== size.height) ctx.view = bubbleView(size.width, size.height);
    directorTick(director, speakers, camera, ctx, Math.min(delta, 0.05));

    if (DEV) chatLog.active.length = 0;
    for (let i = 0; i < director.slots.length; i++) {
      const mesh = meshes.current[i];
      const s = director.slots[i];
      if (!mesh) continue;
      if (!s) {
        mesh.visible = false;
        continue;
      }
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const tex = acquireTexture(`npcBubble${i}`, 'v1', bubbleTexture);
      if (mat.map !== tex) {
        mat.map = tex;
        mat.needsUpdate = true;
        s.dirty = true;
      }
      if (s.dirty) {
        const c2d = (tex.image as HTMLCanvasElement).getContext('2d');
        if (c2d) drawBubble(c2d, s.layout, brand);
        tex.needsUpdate = true;
        s.dirty = false;
        if (DEV) chatLog.shown += 1;
        // font henüz inmediyse inince yeniden çiz (font tuzağı)
        const font = bubbleFont(brand, s.layout.px);
        if (!fontFailed && !document.fonts.check(font, s.layout.text)) {
          const slot = s;
          void document.fonts.load(font, slot.layout.text).then(
            () => {
              if (director.slots.includes(slot)) slot.dirty = true;
            },
            () => {
              fontFailed = true;
            },
          );
        }
      }
      const t = director.t;
      const fadeIn = Math.min(1, (t - s.start) / FADE_IN);
      const fadeOut = Math.min(1, Math.max(0, (s.end + FADE_OUT - t) / FADE_OUT));
      mat.opacity = Math.min(fadeIn, fadeOut);
      mesh.userData.pop = reduced ? 1 : 0.85 + 0.15 * fadeIn;
      mesh.visible = true;
      if (DEV) chatLog.active.push({ text: s.layout.text, lang: s.lang, zone: speakers[s.speaker]?.talk.zone ?? '' });
    }
  });

  /** Kameranın bu kareki son hâliyle: konuşanın başında, ekranda sabit boyutta, kameraya dönük. */
  const place = (i: number) => (_r: THREE.WebGLRenderer, _s: THREE.Scene, camera: THREE.Camera) => {
    const mesh = meshes.current[i];
    const s = director.slots[i];
    const sp = s ? speakers[s.speaker] : undefined;
    if (!mesh || !s || !sp) return;
    mesh.position.set(sp.ref.x, sp.talk.headY, sp.ref.z);
    const depth = Math.max(0.1, -tmpV.copy(mesh.position).applyMatrix4(camera.matrixWorldInverse).z);
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const h = (BUBBLE_CANVAS.h * ctx.view.k * 2 * depth * Math.tan(fov / 2)) / ctx.view.h;
    const pop = (mesh.userData.pop as number | undefined) ?? 1;
    mesh.scale.set(h * ASPECT * pop, h * pop, 1);
    mesh.quaternion.copy(camera.quaternion);
    mesh.updateMatrixWorld();
  };

  return (
    <group name="zone-chat-bubbles">
      {Array.from({ length: slots }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
            if (m) m.onBeforeRender = place(i);
          }}
          args={[geometry]}
          visible={false}
          renderOrder={10}
          raycast={noRaycast}
          frustumCulled={false}
        >
          <meshBasicMaterial transparent depthTest={false} depthWrite={false} toneMapped={false} fog={false} opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
