'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { BUBBLE_LAYER, INK, releaseToonRamp, TOON_FRAG, TOON_VERT, toonifyScene } from '@/lib/zone/toon';

/**
 * Zone'un görünümü: "çizgi film" (toon + mürekkep kontur).
 *
 * 1. Işık alan materyaller toon'a çevrilir (her kare ucuz tarama: geç bağlanan bileşen de ilk
 *    çiziminden önce yakalanır, standart materyalle bir kare bile görünmez).
 * 2. Dünya tam çözünürlükte, MSAA'lı bir hedefe çizilir (renk + derinlik).
 * 3. Tam ekran üçgen: renk + derinlikten mürekkep kontur → ekran.
 * 4. Konuşma balonları (katman 1) en üstte, çizgisiz.
 */
export function ToonPass() {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  const target = useMemo(() => {
    // sRGB 8 bit (SRGB8_ALPHA8): her WebGL2 cihazında MSAA'lı çizilebilir; koyu degradeler
    // doğrusal 8 bitteki gibi basamaklanmaz. Okurken donanım doğrusala çevirir.
    const rt = new THREE.WebGLRenderTarget(1, 1, {
      samples: 4,
      depthBuffer: true,
      colorSpace: THREE.SRGBColorSpace,
      generateMipmaps: false,
    });
    rt.depthTexture = new THREE.DepthTexture(1, 1);
    return rt;
  }, []);

  const post = useMemo(() => {
    // WebGL2'de GLSL 3.00 derlenir (texelFetch); glslVersion verilmez — verilirse three
    // gl_FragColor çıkışını tanımlamaz.
    const material = new THREE.ShaderMaterial({
      vertexShader: TOON_VERT,
      fragmentShader: TOON_FRAG,
      uniforms: {
        tColor: { value: target.texture },
        tDepth: { value: target.depthTexture },
        uStep: { value: 1 },
        uNear: { value: 0.1 },
        uFar: { value: 1000 },
        uInk: { value: new THREE.Color(INK) },
      },
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    // tek büyük üçgen ekranı örter (köşegen dikişi yok)
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);
    return { scene, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), material, geometry };
  }, [target]);

  useEffect(
    () => () => {
      target.depthTexture?.dispose();
      target.dispose();
      post.material.dispose();
      post.geometry.dispose();
      releaseToonRamp();
    },
    [target, post],
  );

  useFrame(({ scene, camera }) => {
    toonifyScene(scene);

    const dpr = gl.getPixelRatio();
    const w = Math.max(1, Math.round(size.width * dpr));
    const h = Math.max(1, Math.round(size.height * dpr));
    if (target.width !== w || target.height !== h) target.setSize(w, h);

    const mask = camera.layers.mask;
    // 1) dünya
    camera.layers.set(0);
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // 2) renk + kontur
    const cam = camera as THREE.PerspectiveCamera;
    const u = post.material.uniforms;
    if (u.uStep) u.uStep.value = Math.max(1, Math.round(dpr * 1.5));
    if (u.uNear) u.uNear.value = cam.near;
    if (u.uFar) u.uFar.value = cam.far;
    gl.render(post.scene, post.camera);

    // 3) balonlar en üstte
    camera.layers.set(BUBBLE_LAYER);
    const auto = gl.autoClear;
    gl.autoClear = false;
    gl.render(scene, camera);
    gl.autoClear = auto;
    camera.layers.mask = mask;
  }, 1);

  return null;
}
