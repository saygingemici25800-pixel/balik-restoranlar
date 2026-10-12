import * as THREE from 'three';

import { acquireToonRamp } from '@/lib/zone/toon';
import { HIP_Y, LEG_X, SHOULDER_DY, SHOULDER_X } from './body';

/**
 * İnsan materyali (toon) — oturanlar TEK, ayakta/yürüyenler TEK, kahraman ayrı bir çizim çağrısı.
 * `MeshToonMaterial` üstüne kurulu: sahneyle aynı ışık, aynı kademeler, aynı sis; gövde
 * `body.ts`'ten (parça, uzuv, silüet öznitelikleri).
 *
 * CPU kare başına neredeyse hiçbir şey yapmaz; GPU'da:
 * - **Yön:** örneğin baktığı yön (`aFace`, 0 = +z) gövdeyi Y ekseninde döndürür.
 * - **Silüet:** `aRow` (`SILS` sırası) örneğin saçını/şapkasını/eteğini seçer; kapalı parça çöker.
 * - **Yemek yeme (oturan):** her misafirin kendi fazı ve periyodu; periyodun son %14'ünde sol el
 *   ağza kalkar. Hareket azaltmada (`uEat` 0) ve yeni oturmuş masada kimse yemez.
 * - **Yürüyüş (ayakta):** `aMode` 0 yürür (bacak/kol salınımı + hafif sekme), 1 durur, 2 telefonla
 *   fotoğraf çeker (kollar kalkar, telefon görünür). Hareket azaltmada (`uMove` 0) herkes durur.
 *   `aVis` yolun iki ucunda solma (yeniden doğma görünmesin).
 * - **Kahraman:** salınım dışarıdan (`uSwing`, karakterin adım fazı); hiç solmaz.
 * - **Boyama:** parça → ten/üst/alt/saç (örnek başına palet indeksi); etekli silüette bacak ten.
 *   Kahramanın çizgili tişörtü gövde yüksekliğinden şerit.
 * - **Koruma:** kameraya çok yakın misafir ve kamera ile kahraman arasında kalan misafir
 *   titreşimli (dither) soluklaşır — kahraman kalabalıkta kaybolmaz.
 */

export type CrowdKind = 'seated' | 'standing' | 'hero';

const VERTEX_PARS = /* glsl */ `
attribute float aPart;
attribute float aLimb;
attribute float aSil;
#ifndef HERO
attribute float aFace;
attribute float aRow;
attribute vec4 aPal;
attribute vec2 aAnim;
#endif
#ifdef STANDING
attribute float aMode;
attribute float aVis;
uniform float uMove;
#endif
uniform float uTime;
uniform float uEat;
uniform float uSwing;
uniform vec3 uHero;
uniform vec2 uNear;
uniform vec3 uPalette[PAL_N];
varying vec3 vTint;
varying float vStripe;
varying float vFade;

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
`;

/** Poz: uzuv dönüşü (pivot etrafında) + yön; kapalı silüet parçası çöker. */
const POSE = /* glsl */ `
#ifdef HERO
  float face = 0.0;
  float row = 0.0;
  vec4 pal = vec4(0.0, 1.0, 2.0, 3.0);
#else
  float face = aFace;
  float row = aRow;
  vec4 pal = aPal;
#endif
  float limb = floor(aLimb + 0.5);
  float hidden = 1.0 - mod(floor(aSil / exp2(floor(row + 0.5))), 2.0);
  mat3 R = mat3(1.0);
  vec3 pivot = vec3(0.0);
  float bob = 0.0;
  float swing = 0.0;
  float phone = 0.0;
#ifdef STANDING
  float walking = (aMode < 0.5 && uMove > 0.5) ? 1.0 : 0.0;
  // aAnim: (faz, saniyedeki adım çifti)
  swing = walking * sin(PI2 * (uTime * aAnim.y + aAnim.x));
  phone = aMode > 1.5 ? 1.0 : 0.0;
  bob = walking * 0.022 * (1.0 - abs(swing));
  hidden = max(hidden, (limb > 6.5 && phone < 0.5) ? 1.0 : 0.0);
#endif
#ifdef HERO
  swing = uSwing;
#endif
  float side = 0.0;
  if (limb > 0.5 && limb < 2.5) {
    // bacak: kalçadan ileri-geri
    side = limb < 1.5 ? 1.0 : -1.0;
    pivot = vec3(side * LEG_X, HIP_Y, 0.0);
    R = rotX(-side * swing * 0.42);
  } else if (limb > 2.5 && limb < 4.5) {
    // kol: omuzdan, bacağın tersine; telefonda iki kol öne-yukarı, içe
    side = limb < 3.5 ? 1.0 : -1.0;
    pivot = vec3(side * SHOULDER_X, HIP_Y + SHOULDER_DY, 0.0);
    float a = side * swing * 0.38;
#ifdef SEATED
    // yemek: sol el ağza (periyodun son %14'ü)
    float eat = uEat * step(aAnim.y, 1e5) * smoothstep(0.84, 0.88, fract(uTime / aAnim.y + aAnim.x))
      * (1.0 - smoothstep(0.96, 1.0, fract(uTime / aAnim.y + aAnim.x)));
    a = side > 0.0 ? -0.75 * eat : 0.0;
    R = rotX(a) * rotZ(-side * 0.35 * eat);
#else
    R = rotX(mix(a, -1.95, phone)) * rotZ(-side * 0.38 * phone);
#endif
  }
  mat3 RF = rotY(face) * R;
`;

const FADE = /* glsl */ `
{
  vec3 c = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
#ifdef USE_INSTANCING
  c = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
#endif
#ifdef HERO
  vFade = 1.0;
#else
  vec2 d = c.xz - cameraPosition.xz;
  float len = max(length(d), 1e-3);
  // kameranın dibindeki misafir soluklaşır (ayaktakiler daha uzun: kadrajı daha erken kaplar)
  float nearF = smoothstep(uNear.x, uNear.y, len);
  vec2 ch = uHero.xz - cameraPosition.xz;
  float t = dot(d, ch) / max(dot(ch, ch), 1e-4);
  float off = length(d - ch * clamp(t, 0.0, 1.0));
  float onLine = (t > 0.05 && t < 0.97 && abs(c.y - uHero.y) < 1.0) ? 1.0 : 0.0;
  // ekranda örtüşme: kameraya yakın (t küçük) misafir hatta daha yakın olmalı ki kahramanı kapatsın
  float edge = 0.22 + 0.25 * clamp(t, 0.0, 1.0);
  float occl = mix(1.0, mix(0.4, 1.0, smoothstep(edge - 0.12, edge, off)), onLine);
  vFade = min(nearF, occl);
#ifdef STANDING
  vFade *= aVis;
#endif
#endif
}
`;

const TINT = /* glsl */ `
{
  float part = floor(aPart + 0.5);
  // etekli silüetlerde (uzun saç, topuz) bacak ten rengi
  float skirted = (abs(row - 1.0) < 0.5 || abs(row - 4.0) < 0.5) ? 1.0 : 0.0;
#ifdef HERO
  skirted = HERO_SKIRT;
#endif
  vec3 skin = uPalette[int(pal.x + 0.5)];
  vec3 top = uPalette[int(pal.y + 0.5)];
  vec3 bottom = uPalette[int(pal.z + 0.5)];
  vec3 hair = uPalette[int(pal.w + 0.5)];
  vTint = part < 0.5 ? skin
    : part < 1.5 ? top
    : part < 2.5 ? bottom
    : part < 3.5 ? hair
    : part < 4.5 ? vec3(0.06, 0.05, 0.07)
    : part < 5.5 ? mix(bottom, skin, skirted)
    : part < 6.5 ? top
    : vec3(0.044, 0.023, 0.014);
  vStripe = (part > 5.5 && part < 6.5) ? position.y : -1.0;
}
`;

function inject(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${VERTEX_PARS}`)
    .replace(
      '#include <beginnormal_vertex>',
      `${POSE}
  vec3 objectNormal = RF * normal;`,
    )
    .replace(
      '#include <begin_vertex>',
      `vec3 transformed = rotY(face) * pivot + RF * (position - pivot) + vec3(0.0, bob, 0.0);
  if (hidden > 0.5) transformed = vec3(0.0);`,
    )
    .replace('#include <fog_vertex>', `#include <fog_vertex>\n${FADE}\n${TINT}`);

  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      `#include <common>
varying vec3 vTint;
varying float vStripe;
varying float vFade;`,
    )
    .replace(
      '#include <clipping_planes_fragment>',
      `#include <clipping_planes_fragment>
  if (vFade < 0.999) {
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    if (n > vFade) discard;
  }`,
    )
    .replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `vec3 tint = vTint;
  // balıkçı tişörtü: lacivert-beyaz yatay şerit (gövde yüksekliğinden)
  if (vStripe > -0.5) tint = mix(tint, vec3(0.012, 0.027, 0.09), step(0.5, fract(vStripe * 15.0)));
  vec4 diffuseColor = vec4( tint, opacity );`,
    );
}

export type CrowdUniforms = {
  uTime: THREE.IUniform<number>;
  uEat: THREE.IUniform<number>;
  uMove: THREE.IUniform<number>;
  uSwing: THREE.IUniform<number>;
  uHero: THREE.IUniform<THREE.Vector3>;
};

const NEAR: Record<CrowdKind, [number, number]> = { seated: [0.8, 1.8], standing: [2.2, 4.0], hero: [0, 0] };

export type CrowdMaterial = THREE.MeshToonMaterial & { uniforms: CrowdUniforms };

/**
 * `palette`: kalabalıkta `PALETTE` (örnek başına indeksli); kahramanda tam 4 renk
 * (ten, üst, alt, saç) — `heroSkirt` kahramanın bacağını ten yapar.
 */
export function createCrowdMaterial(kind: CrowdKind, palette: readonly string[], heroSkirt = false): CrowdMaterial {
  const uniforms: CrowdUniforms & Record<string, THREE.IUniform> = {
    uTime: { value: 0 },
    uEat: { value: 1 },
    uMove: { value: 1 },
    uSwing: { value: 0 },
    uHero: { value: new THREE.Vector3() },
    uNear: { value: new THREE.Vector2(...NEAR[kind]) },
    uPalette: { value: palette.map((c) => new THREE.Color(c)) },
  };
  const material = new THREE.MeshToonMaterial({ gradientMap: acquireToonRamp() }) as CrowdMaterial;
  material.uniforms = uniforms;
  material.defines = {
    PAL_N: palette.length,
    HIP_Y: (kind === 'seated' ? HIP_Y.seated : HIP_Y.standing).toFixed(3),
    SHOULDER_DY: SHOULDER_DY.toFixed(3),
    SHOULDER_X: SHOULDER_X.toFixed(3),
    LEG_X: LEG_X.toFixed(3),
    ...(kind === 'seated' ? { SEATED: 1 } : kind === 'standing' ? { STANDING: 1 } : { HERO: 1, HERO_SKIRT: heroSkirt ? '1.0' : '0.0' }),
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    inject(shader);
  };
  material.customProgramCacheKey = () => `zone-crowd-${kind}-${palette.length}-${heroSkirt ? 1 : 0}`;
  return material;
}
