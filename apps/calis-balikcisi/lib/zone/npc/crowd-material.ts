import * as THREE from 'three';

import { SEATED_ATLAS, SEATED_COLS, STANDING_ATLAS, STANDING_COLS } from './atlas';
import { SEATED_CELL, SEATED_QUAD } from './person';
import { STANDING_CELL, STANDING_QUAD } from './person-standing';

/**
 * Misafir billboard materyali — oturanlar TEK, ayakta/yürüyenler TEK çizim çağrısında (instanced).
 * İki tür aynı shader'ı paylaşır; `STANDING` tanımı kare seçimini değiştirir.
 *
 * CPU kare başına neredeyse hiçbir şey yapmaz; GPU'da:
 * - **Billboard:** düzlem yalnız Y ekseninde kameraya döner (kahramanla aynı kural).
 * - **Görünüm:** misafirin baktığı yön ile kamera yönü arasındaki açı → back/back34/side/front,
 *   sol taraf aynalanır. `figure.ts` `viewFor`/`mirrorFor`'un GLSL ikizi.
 * - **Yemek yeme (oturan):** her misafirin kendi fazı ve periyodu; periyodun son %14'ünde çatal
 *   ağızda. Hareket azaltmada (`uEat` 0) ve yeni oturmuş masada kimse yemez.
 * - **Yürüyüş (ayakta):** `aMode` 0 yürür (adım kareleri + hafif sekme), 1 durur, 2 telefonla
 *   fotoğraf çeker. Hareket azaltmada (`uMove` 0) herkes duruş karesinde. `aVis` yolun iki
 *   ucunda solma (yeniden doğma görünmesin).
 * - **Boyama:** atlas anahtarları (ten/üst/alt/saç/kontur) örnek başına paletten renk alır.
 * - **Koruma:** kameraya çok yakın misafir ve kamera ile kahraman arasında kalan misafir
 *   titreşimli (dither) soluklaşır — kahraman kalabalıkta kaybolmaz, kamera kimsenin içinden
 *   "geçmiş" görünmez.
 * Opak geçişte çizilir (sıralama yok), kenarlar MSAA ile `alphaToCoverage`.
 */

const VERTEX = /* glsl */ `
attribute float aFace;
attribute float aRow;
attribute vec4 aPal;
attribute vec2 aAnim;
#ifdef STANDING
attribute float aMode;
attribute float aVis;
uniform float uMove;
#endif
uniform float uTime;
uniform float uEat;
uniform vec3 uHero;
uniform float uCellV;
uniform float uCols;
uniform vec2 uQuad;
uniform vec2 uNear;
varying vec2 vUv;
varying vec4 vPal;
varying float vFade;
#include <common>
#include <fog_pars_vertex>

void main() {
  vec3 c = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float sc = length(instanceMatrix[0].xyz);
  vec2 d = c.xz - cameraPosition.xz;

  // görünüm: |rel| 0 = sırtı dönük ... π = yüzü dönük (viewFor ile aynı kovalar)
  float rel = mod(aFace - atan(d.x, d.y) + PI, PI2) - PI;
  float view = min(floor(abs(rel) / (0.25 * PI) + 0.5), 3.0);
  float flip = (rel < 0.0 && view > 0.5 && view < 2.5) ? 1.0 : 0.0;
#ifdef STANDING
  // aAnim: (faz, saniyedeki adım çifti); kare 1/2 adım, 0 duruş, 3 telefon
  float cyc = uTime * aAnim.y + aAnim.x;
  float walking = (aMode < 0.5 && uMove > 0.5) ? 1.0 : 0.0;
  // önden/arkadan kare 1–2 = sol/sağ adım (döngü = 2 adım); profilde kare 1–2 = açık adım/geçiş
  // (döngü = 1 adım) → profilde iki kat hızlı, yoksa yürüyen kayıyor gibi görünür
  float spc = (view > 1.5 && view < 2.5) ? 2.0 : 1.0;
  float ph = fract(cyc * spc);
  float frame = walking > 0.5 ? 1.0 + step(0.5, ph) : (aMode > 1.5 ? 3.0 : 0.0);
  // sekme: profilde açık adımda alçak, geçişte yüksek; önden her adımda
  float bob = walking * 0.03 * (spc > 1.5 ? max(0.0, -sin(PI2 * ph)) : abs(sin(PI2 * cyc)));
#else
  // yemek yok: hareket azaltmada (uEat 0) ve yeni oturmuş masada (periyot ≥ 1e5) çatal hep inik
  float frame = uEat * step(aAnim.y, 1e5) * step(0.86, fract(uTime / aAnim.y + aAnim.x));
  float bob = 0.0;
#endif
  float u = mix(uv.x, 1.0 - uv.x, flip);
  vUv = vec2((frame * 4.0 + view + u) / uCols, 1.0 - (aRow + 1.0 - uv.y) * uCellV);
  vPal = aPal;

  float len = max(length(d), 1e-3);
  vec2 toCam = -d / len;
  vec3 right = vec3(toCam.y, 0.0, -toCam.x);
  vec3 p = c + right * (position.x * uQuad.x * sc) + vec3(0.0, (position.y * uQuad.y + bob) * sc, 0.0);

  // koruma: kameranın dibinde ya da kamera → kahraman hattında
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

  vec4 mvPosition = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAGMENT = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec3 uPalette[PAL_N];
uniform vec3 uOutline;
varying vec2 vUv;
varying vec4 vPal;
varying float vFade;
#include <common>
#include <fog_pars_fragment>

void main() {
  vec4 t = texture2D(uAtlas, vUv);
  if (t.a < 0.08) discard;
  if (vFade < 0.999) {
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    if (n > vFade) discard;
  }
  // anahtar ayrışımı: saç = beyaz payı, ten/üst/alt = kanal fazlası, kontur = kalan
  float h = min(min(t.r, t.g), t.b);
  vec3 w = t.rgb - h;
  float o = clamp(1.0 - (w.r + w.g + w.b + h), 0.0, 1.0);
  vec3 col = uPalette[int(vPal.x + 0.5)] * w.r
    + uPalette[int(vPal.y + 0.5)] * w.g
    + uPalette[int(vPal.z + 0.5)] * w.b
    + uPalette[int(vPal.w + 0.5)] * h
    + uOutline * o;
  // kahraman (×1) kalabalıkta bir ton öne çıksın
  gl_FragColor = vec4(col * 0.93, t.a);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`;

export type CrowdUniforms = {
  uTime: THREE.IUniform<number>;
  uEat: THREE.IUniform<number>;
  uMove: THREE.IUniform<number>;
  uHero: THREE.IUniform<THREE.Vector3>;
  uAtlas: THREE.IUniform<THREE.Texture>;
};

export type CrowdKind = 'seated' | 'standing';

const LAYOUT: Record<CrowdKind, { cellV: number; cols: number; quad: { w: number; h: number }; near: [number, number] }> = {
  seated: { cellV: SEATED_CELL.h / SEATED_ATLAS.h, cols: SEATED_COLS, quad: SEATED_QUAD, near: [0.8, 1.8] },
  standing: { cellV: STANDING_CELL.h / STANDING_ATLAS.h, cols: STANDING_COLS, quad: STANDING_QUAD, near: [2.2, 4.0] },
};

export function createCrowdMaterial(kind: CrowdKind, atlas: THREE.Texture, palette: readonly string[], outline: string) {
  const layout = LAYOUT[kind];
  // Sis uniform'ları kopyalanır; doku ASLA `UniformsUtils.merge`'e verilmez (dokuyu klonlar →
  // defter dışı ikinci GPU yüklemesi).
  const uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.fog) as Record<string, THREE.IUniform>;
  Object.assign(uniforms, {
    uTime: { value: 0 },
    uEat: { value: 1 },
    uMove: { value: 1 },
    uHero: { value: new THREE.Vector3() },
    uAtlas: { value: atlas },
    uPalette: { value: palette.map((c) => new THREE.Color(c)) },
    uOutline: { value: new THREE.Color(outline) },
    uCellV: { value: layout.cellV },
    uCols: { value: layout.cols },
    uQuad: { value: new THREE.Vector2(layout.quad.w, layout.quad.h) },
    uNear: { value: new THREE.Vector2(layout.near[0], layout.near[1]) },
  });
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    defines: kind === 'standing' ? { PAL_N: palette.length, STANDING: 1 } : { PAL_N: palette.length },
    fog: true,
    alphaToCoverage: true,
  });
  return material as THREE.ShaderMaterial & { uniforms: CrowdUniforms };
}
