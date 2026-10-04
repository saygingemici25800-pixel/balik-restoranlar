'use client';

import { useLayoutEffect, type RefObject } from 'react';
import * as THREE from 'three';

/**
 * Dekor için instancing yardımcıları (Faz 2). Yüzlerce sandalye/ayak/ampul tek çizim çağrısında
 * çizilir. Matrisler modül seviyesinde bir kez hesaplanır; bileşen yalnız uygular.
 */

const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpColor = new THREE.Color();

type Vec3 = readonly [number, number, number];

/** Konum + (isteğe bağlı) dönüş + ölçek → matris. */
export function m4(p: Vec3, r: Vec3 = [0, 0, 0], s: Vec3 = [1, 1, 1], order: THREE.EulerOrder = 'XYZ') {
  tmpE.set(r[0], r[1], r[2], order);
  tmpQ.setFromEuler(tmpE);
  return new THREE.Matrix4().compose(tmpP.set(p[0], p[1], p[2]), tmpQ, tmpS.set(s[0], s[1], s[2]));
}

/**
 * Matrisleri (ve varsa renkleri) instanced mesh'e yazar, sınır küresini günceller — frustum
 * culling tüm örnekleri kapsasın.
 */
export function useInstances(
  ref: RefObject<THREE.InstancedMesh | null>,
  matrices: readonly THREE.Matrix4[],
  colors?: readonly string[],
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    if (colors) colors.forEach((c, i) => mesh.setColorAt(i, tmpColor.set(c)));
    mesh.count = matrices.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, matrices, colors]);
}

/**
 * Dekor ışın testine HİÇ girmez: masalar/sandalyeler tıklanamaz, hover almaz (karar 2026-10-01).
 * R3F yalnız olay dinleyicisi olan nesneleri test ediyor; bu, niyeti kodda da kesinleştirir.
 */
export const noRaycast = () => {};
