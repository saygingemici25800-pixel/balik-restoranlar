/**
 * Kurgusal insanların ve kahramanın 3B gövdesi (toon görünüm) — tek geometri, tek çizim çağrısı.
 *
 * Renk değil PARÇA yazılır (`aPart`): shader örnek başına paletten boyar (`crowd-material`).
 * Uzuv kimliği (`aLimb`) yürüyüş / yemek / telefon pozunu shader'da verir; silüet maskesi
 * (`aSil`, bit = `SILS` sırası) saç, şapka ve eteği örneğe göre açar — kapalı parça sıfıra
 * çöker (görünmez, ek çağrı yok).
 *
 * Ölçüler eski sprite'larla aynı: kalça 0.9 (oturan 0.47), omuz +0.46, baş merkezi +0.65 —
 * balon yükseklikleri ve masa düzeni değişmeden kalır. Yüz +z'ye bakar (`face` 0 = +z).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Parça → renk kanalı (shader `tint()` ile aynı sıra). */
export const PART = { SKIN: 0, TOP: 1, BOTTOM: 2, HAIR: 3, DARK: 4, LEG: 5, STRIPE: 6, BEARD: 7 } as const;
/** Uzuv → poz (shader ile aynı). Sol/sağ kişinin kendi solu (+x) / sağı (−x). */
export const LIMB = { BODY: 0, LEG_L: 1, LEG_R: 2, ARM_L: 3, ARM_R: 4, PHONE: 7 } as const;

/** Silüet bitleri — `pen.ts` `SILS` sırası: short, long, elder, sunhat, bun. */
const B = { short: 1, long: 2, elder: 4, sunhat: 8, bun: 16 } as const;
const ALL = 31;
const SKIRTED = B.long | B.bun;
const TROUSERED = ALL & ~SKIRTED;

export const HIP_Y = { standing: 0.9, seated: 0.47 } as const;
export const SHOULDER_DY = 0.46;
export const SHOULDER_X = 0.19;
export const LEG_X = 0.075;

export type BodyPose = 'standing' | 'seated';
/** Kahraman imzası: balıkçı (çizgili tişört, bere, sakal) ya da etekli kız. */
export type HeroLook = 'erkek' | 'kiz';

type Piece = { geo: THREE.BufferGeometry; part: number; limb: number; sil: number };

const SEG = { cap: 2, radial: 9, sphereW: 14, sphereH: 10 } as const;

const m4 = () => new THREE.Matrix4();
const at = (x: number, y: number, z: number) => m4().makeTranslation(x, y, z);

function shaped(geo: THREE.BufferGeometry, matrix: THREE.Matrix4) {
  geo.applyMatrix4(matrix);
  return geo;
}
const capsule = (r: number, len: number, mx: THREE.Matrix4) => shaped(new THREE.CapsuleGeometry(r, len, SEG.cap, SEG.radial), mx);
const sphere = (r: number, mx: THREE.Matrix4, w: number = SEG.sphereW, h: number = SEG.sphereH) =>
  shaped(new THREE.SphereGeometry(r, w, h), mx);
const cylinder = (rt: number, rb: number, h: number, mx: THREE.Matrix4, radial: number = SEG.radial + 3) =>
  shaped(new THREE.CylinderGeometry(rt, rb, h, radial), mx);
const box = (w: number, h: number, d: number, mx: THREE.Matrix4) => shaped(new THREE.BoxGeometry(w, h, d), mx);
/**
 * Saç/bere kepi: kürenin üst dilimi, ekseni geriye yatık — önde alnın üstünde biter (gözler
 * açık kalır), arkada enseye iner. `cover` π'nin kesri.
 */
const hairCap = (r: number, cover: number, tilt: number, mx: THREE.Matrix4) =>
  shaped(new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI * cover).rotateX(tilt), mx);

/** Dönüş + ölçek + konum (Euler XYZ). */
function trs(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  return m4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(sx, sy, sz),
  );
}

/**
 * Kol: omuz pivotundan sarkar; `a1` üst kolun, `a2` dirseğin öne açısı (x ekseni, negatif = öne).
 * Üst kol üst giysi rengi (`sleeve`), ön kol ve el ten.
 */
function arm(out: Piece[], side: 1 | -1, shoulderY: number, a1: number, a2: number, limb: number, sleeve: number) {
  const sx = SHOULDER_X * side;
  const up = new THREE.Euler(a1, 0, side * 0.06);
  const fore = new THREE.Euler(a1 + a2, 0, side * 0.06);
  const dir = (e: THREE.Euler, len: number) => new THREE.Vector3(0, -len, 0).applyEuler(e);
  const s = new THREE.Vector3(sx, shoulderY, 0);
  const elbow = s.clone().add(dir(up, 0.29));
  const upC = s.clone().add(dir(up, 0.16));
  const foreC = elbow.clone().add(dir(fore, 0.12));
  const hand = elbow.clone().add(dir(fore, 0.25));
  out.push({ geo: capsule(0.054, 0.17, trs(upC.x, upC.y, upC.z, up.x, 0, up.z)), part: sleeve, limb, sil: ALL });
  out.push({ geo: capsule(0.045, 0.17, trs(foreC.x, foreC.y, foreC.z, fore.x, 0, fore.z)), part: PART.SKIN, limb, sil: ALL });
  out.push({ geo: sphere(0.047, at(hand.x, hand.y, hand.z), 8, 6), part: PART.SKIN, limb, sil: ALL });
}

function head(out: Piece[], hipY: number, hero: HeroLook | null) {
  const hy = hipY + 0.65;
  out.push({ geo: cylinder(0.044, 0.05, 0.1, at(0, hipY + 0.535, 0)), part: PART.SKIN, limb: LIMB.BODY, sil: ALL });
  out.push({ geo: sphere(0.105, trs(0, hy, 0, 0, 0, 0, 0.95, 1.08, 1)), part: PART.SKIN, limb: LIMB.BODY, sil: ALL });
  out.push({ geo: sphere(0.024, trs(0, hy - 0.012, 0.1, 0, 0, 0, 0.8, 1, 0.9), 8, 6), part: PART.SKIN, limb: LIMB.BODY, sil: ALL });
  for (const s of [-1, 1]) {
    out.push({ geo: sphere(0.013, at(0.038 * s, hy + 0.02, 0.092), 6, 4), part: PART.DARK, limb: LIMB.BODY, sil: ALL });
  }
  if (hero === 'erkek') {
    // bere (balıkçı) + çene boyunca kısa sakal
    out.push({ geo: hairCap(0.124, 0.52, -0.42, trs(0, hy + 0.012, -0.006, 0, 0, 0, 0.98, 1.06, 1)), part: PART.HAIR, limb: LIMB.BODY, sil: ALL });
    out.push({ geo: sphere(0.072, trs(0, hy - 0.068, 0.05, 0, 0, 0, 1.12, 0.58, 0.72)), part: PART.BEARD, limb: LIMB.BODY, sil: ALL });
    return;
  }
  const longHair = hero === 'kiz' ? ALL : B.long;
  const shortHair = hero === 'kiz' ? 0 : B.short | B.elder | B.sunhat | B.bun;
  // kısa saç: tepe ve ense
  if (shortHair) {
    out.push({ geo: hairCap(0.117, 0.55, -0.5, trs(0, hy + 0.01, -0.01, 0, 0, 0, 0.97, 1.04, 1)), part: PART.HAIR, limb: LIMB.BODY, sil: shortHair });
  }
  // uzun saç: biraz daha dolgun kep + omza inen arka tutam
  out.push({ geo: hairCap(0.122, 0.58, -0.55, trs(0, hy + 0.012, -0.012, 0, 0, 0, 1, 1.05, 1)), part: PART.HAIR, limb: LIMB.BODY, sil: longHair });
  out.push({ geo: capsule(0.098, 0.22, trs(0, hy - 0.17, -0.058, 0.1, 0, 0, 1.15, 1, 0.62)), part: PART.HAIR, limb: LIMB.BODY, sil: longHair });
  if (hero) return;
  // topuz
  out.push({ geo: sphere(0.058, at(0, hy + 0.085, -0.075)), part: PART.HAIR, limb: LIMB.BODY, sil: B.bun });
  // hasır şapka: tepe + geniş kenar (renk saç kanalından: şapka renkleri paletin sonunda)
  out.push({ geo: cylinder(0.1, 0.112, 0.08, at(0, hy + 0.09, -0.005), 14), part: PART.HAIR, limb: LIMB.BODY, sil: B.sunhat });
  out.push({ geo: cylinder(0.215, 0.215, 0.014, at(0, hy + 0.05, -0.005), 18), part: PART.HAIR, limb: LIMB.BODY, sil: B.sunhat });
}

/** Omuz hattı: gövde kapsülünün daralan tepesini doldurur (kollar "kabarık kol" gibi durmasın). */
function yoke(out: Piece[], hipY: number, part: number) {
  out.push({ geo: capsule(0.07, 0.25, trs(0, hipY + 0.425, 0, 0, 0, Math.PI / 2, 1, 1, 0.78)), part, limb: LIMB.BODY, sil: ALL });
}

/** Ayakta / yürüyen: bacaklar kalçadan, kollar omuzdan sarkar (poz shader'da). */
function standing(out: Piece[], hero: HeroLook | null) {
  const hipY = HIP_Y.standing;
  const top = hero === 'erkek' ? PART.STRIPE : PART.TOP;
  const skirt = hero === 'kiz' ? ALL : hero ? 0 : SKIRTED;
  const trousers = hero === 'erkek' ? ALL : hero ? 0 : TROUSERED;
  for (const side of [1, -1] as const) {
    const limb = side > 0 ? LIMB.LEG_L : LIMB.LEG_R;
    const x = LEG_X * side;
    out.push({ geo: capsule(0.068, 0.36, at(x, hipY - 0.22, 0)), part: PART.LEG, limb, sil: ALL });
    out.push({ geo: capsule(0.058, 0.34, at(x, hipY - 0.6, 0)), part: PART.LEG, limb, sil: ALL });
    out.push({ geo: box(0.09, 0.06, 0.2, at(x, 0.03, 0.04)), part: PART.DARK, limb, sil: ALL });
  }
  if (trousers) out.push({ geo: box(0.29, 0.15, 0.19, at(0, hipY + 0.01, 0)), part: PART.BOTTOM, limb: LIMB.BODY, sil: trousers });
  if (skirt) {
    out.push({ geo: cylinder(0.155, 0.27, 0.42, at(0, hipY - 0.15, 0), 16), part: PART.BOTTOM, limb: LIMB.BODY, sil: skirt });
  }
  out.push({ geo: capsule(0.15, 0.3, trs(0, hipY + 0.25, 0, 0, 0, 0, 1.18, 1, 0.72)), part: top, limb: LIMB.BODY, sil: ALL });
  yoke(out, hipY, top);
  const shoulderY = hipY + SHOULDER_DY;
  arm(out, 1, shoulderY, 0.04, -0.12, LIMB.ARM_L, top === PART.STRIPE ? PART.STRIPE : PART.TOP);
  arm(out, -1, shoulderY, 0.04, -0.12, LIMB.ARM_R, top === PART.STRIPE ? PART.STRIPE : PART.TOP);
  head(out, hipY, hero);
  if (!hero) {
    // telefon (yalnız fotoğraf çekenlerde açılır): iki elin buluştuğu yer, yüzün önü
    out.push({ geo: box(0.075, 0.14, 0.014, trs(0, hipY + 0.73, 0.42, -0.25, 0, 0)), part: PART.DARK, limb: LIMB.PHONE, sil: ALL });
  }
}

/** Masada oturan: uyluk öne yatay, baldır aşağı; kollar masaya uzanır (yemek shader'da). */
function seated(out: Piece[]) {
  const hipY = HIP_Y.seated;
  for (const side of [1, -1] as const) {
    const x = LEG_X * side;
    out.push({ geo: capsule(0.07, 0.3, trs(x, hipY + 0.01, 0.2, Math.PI / 2, 0, 0)), part: PART.BOTTOM, limb: LIMB.BODY, sil: ALL });
    out.push({ geo: capsule(0.06, 0.3, at(x, hipY - 0.22, 0.4)), part: PART.BOTTOM, limb: LIMB.BODY, sil: ALL });
    out.push({ geo: box(0.09, 0.06, 0.2, at(x, 0.03, 0.44)), part: PART.DARK, limb: LIMB.BODY, sil: ALL });
  }
  out.push({ geo: box(0.3, 0.15, 0.24, at(0, hipY + 0.03, 0.02)), part: PART.BOTTOM, limb: LIMB.BODY, sil: ALL });
  out.push({ geo: capsule(0.15, 0.3, trs(0, hipY + 0.25, 0, 0, 0, 0, 1.18, 1, 0.72)), part: PART.TOP, limb: LIMB.BODY, sil: ALL });
  yoke(out, hipY, PART.TOP);
  const shoulderY = hipY + SHOULDER_DY;
  arm(out, 1, shoulderY, -0.7, -1.0, LIMB.ARM_L, PART.TOP);
  arm(out, -1, shoulderY, -0.7, -1.0, LIMB.ARM_R, PART.TOP);
  head(out, hipY, null);
}

/** Kalabalık (`hero` yok: bütün silüetler maskeli) ya da kahraman gövdesi. */
export function buildBodyGeometry(pose: BodyPose, hero: HeroLook | null = null): THREE.BufferGeometry {
  const pieces: Piece[] = [];
  if (pose === 'seated') seated(pieces);
  else standing(pieces, hero);

  const geos = pieces.map(({ geo, part, limb, sil }) => {
    // hepsi indeksli (kapsül, küre, silindir, kutu); uv gerekmez
    const g = geo;
    g.deleteAttribute('uv');
    const n = g.getAttribute('position').count;
    g.setAttribute('aPart', new THREE.Float32BufferAttribute(new Float32Array(n).fill(part), 1));
    g.setAttribute('aLimb', new THREE.Float32BufferAttribute(new Float32Array(n).fill(limb), 1));
    g.setAttribute('aSil', new THREE.Float32BufferAttribute(new Float32Array(n).fill(sil), 1));
    return g;
  });
  const merged = mergeGeometries(geos, false);
  for (const g of geos) g.dispose();
  if (!merged) throw new Error('zone body: geometri birleştirilemedi');
  merged.computeBoundingSphere();
  return merged;
}
