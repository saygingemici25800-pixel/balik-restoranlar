/**
 * Zone görünümü: "çizgi film" — düz renk kademeleri (toon) + mürekkep kontur (`toon-pass.tsx`).
 *
 * - Işık alan her materyal (Standard / Lambert / Phong) `MeshToonMaterial`'e çevrilir: rengi,
 *   dokusu, saydamlığı, kırpma düzlemleri korunur; ışık 4 kademeye iner (`TOON_RAMP`).
 * - Kontur derinlikten: 1/z ekranda düzlem boyunca doğrusaldır, ikinci farkı düz yüzeyde ~0,
 *   silüette ve kırışta büyük. Böylece yatık zemin yanlış çizgi üretmez, ayrı normal geçişi
 *   gerekmez (sahne kare başına bir kez çizilir).
 */
import * as THREE from 'three';

/** Konuşma balonlarının katmanı: konturdan SONRA, en üstte çizilir (çizgi almaz, okunur kalır). */
export const BUBBLE_LAYER = 1;

/** Kontur rengi (sRGB): gece mavisi-mor, saf siyah değil — gün batımında yumuşak. */
export const INK = '#241c2e';

/* ------------------------------- ışık kademesi ------------------------------- */

let ramp: THREE.DataTexture | null = null;

/** 4 kademeli ışık rampası (en karanlık kademe bile okunur kalsın: 0.42). */
export function acquireToonRamp(): THREE.DataTexture {
  if (ramp) return ramp;
  const d = new Uint8Array([108, 170, 222, 255]);
  const t = new THREE.DataTexture(d, d.length, 1, THREE.RedFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  ramp = t;
  return t;
}

export function releaseToonRamp() {
  ramp?.dispose();
  ramp = null;
}

/* ------------------------------ materyal çevirisi ------------------------------ */

type Lit = THREE.MeshStandardMaterial | THREE.MeshLambertMaterial | THREE.MeshPhongMaterial;

const isLit = (m: THREE.Material): m is Lit =>
  (m as THREE.MeshStandardMaterial).isMeshStandardMaterial === true ||
  (m as THREE.MeshLambertMaterial).isMeshLambertMaterial === true ||
  (m as THREE.MeshPhongMaterial).isMeshPhongMaterial === true;

/** Aynı kaynak materyal → aynı toon materyal (paylaşım korunur, program sayısı artmaz). */
const converted = new WeakMap<THREE.Material, THREE.MeshToonMaterial>();

function toToon(src: Lit): THREE.MeshToonMaterial {
  const hit = converted.get(src);
  if (hit) return hit;
  const m = new THREE.MeshToonMaterial({
    color: src.color,
    map: src.map,
    alphaMap: src.alphaMap,
    emissive: src.emissive,
    emissiveMap: src.emissiveMap,
    emissiveIntensity: src.emissiveIntensity,
    gradientMap: acquireToonRamp(),
    transparent: src.transparent,
    opacity: src.opacity,
    alphaTest: src.alphaTest,
    alphaToCoverage: src.alphaToCoverage,
    side: src.side,
    vertexColors: src.vertexColors,
    fog: src.fog,
    depthWrite: src.depthWrite,
    depthTest: src.depthTest,
    polygonOffset: src.polygonOffset,
    polygonOffsetFactor: src.polygonOffsetFactor,
    polygonOffsetUnits: src.polygonOffsetUnits,
    clippingPlanes: src.clippingPlanes,
    visible: src.visible,
  });
  m.name = src.name;
  m.userData.toonOf = src;
  // kaynak atılınca (bileşen söküldü) karşılığı da gider
  src.addEventListener('dispose', () => m.dispose());
  converted.set(src, m);
  return m;
}

/**
 * Sahnede ışık alan materyalleri toon'a çevirir. Değişen mesh sayısını döndürür. Ucuzdur:
 * çevrilmiş mesh atlanır; yeni bağlanan (geç yüklenen) bileşenler sonraki taramada yakalanır.
 */
export function toonifyScene(root: THREE.Object3D): number {
  let changed = 0;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    if (Array.isArray(mesh.material)) {
      if (!mesh.material.some(isLit)) return;
      mesh.material = mesh.material.map((m) => (isLit(m) ? toToon(m) : m));
      changed += 1;
    } else if (isLit(mesh.material)) {
      mesh.material = toToon(mesh.material);
      changed += 1;
    }
  });
  return changed;
}

/* --------------------------------- kontur geçişi --------------------------------- */

export const TOON_VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Renk + mürekkep. `uStep` cihaz pikseli (çizgi kalınlığı ≈ 3 CSS px her ekranda).
 * Sonda renk uzayı dönüşümü (ekran sRGB); ton eşleme yok — düz toon renkleri olduğu gibi.
 */
export const TOON_FRAG = /* glsl */ `
#include <packing>
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform float uStep;
uniform float uNear;
uniform float uFar;
uniform vec3 uInk;

float invZ(vec2 p) {
  float d = texelFetch(tDepth, ivec2(p), 0).r;
  return 1.0 / max(-perspectiveDepthToViewZ(d, uNear, uFar), 1e-3);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  ivec2 hi = textureSize(tDepth, 0) - 1;
  vec2 lo = vec2(0.0);
  vec2 top = vec2(hi);
  vec4 c = texelFetch(tColor, ivec2(p), 0);

  float w = invZ(p);
  float wl = invZ(clamp(p - vec2(uStep, 0.0), lo, top));
  float wr = invZ(clamp(p + vec2(uStep, 0.0), lo, top));
  float wd = invZ(clamp(p - vec2(0.0, uStep), lo, top));
  float wu = invZ(clamp(p + vec2(0.0, uStep), lo, top));
  // 1/z'nin ikinci farkı, yakındaki komşuya göre oranlı: düz yüzeyde 0, silüet ve kırışta büyük
  float wn = max(max(wl, wr), max(wd, wu));
  float lap = max(abs(wl + wr - 2.0 * w), abs(wd + wu - 2.0 * w)) / max(wn, 1e-4);
  float e = smoothstep(0.035, 0.09, lap);
  // uzak ufukta (dağ, deniz çizgisi) çizgi söner; çok yakında (kamera dibindeki dal) de incelir
  float zNear = 1.0 / wn;
  e *= 1.0 - smoothstep(26.0, 70.0, zNear);
  vec3 col = mix(c.rgb, uInk, e * 0.9);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;
