/**
 * Açı matematiği (docs/zone-3d-modul.md bölüm 5.1) — yön takipli kameranın üç tuzağı burada
 * kapatılır. Saf fonksiyonlar: sahneye bağlı değil, tarayıcı gerektirmez.
 *
 * MANCH Zone'dan aynen alındı (kanıtlanmış, dokunulmaz — bölüm 15).
 */

const TAU = Math.PI * 2;

/** −π .. π aralığına indirger. `atan2` çıktısıyla aynı aralık. */
export function normalizeAngle(a: number): number {
  return ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
}

/**
 * **Tuzak (c): sabit yumuşatma katsayısı kare hızına bağımlıdır.**
 *
 * `a += (b-a) * 0.08` her karede aynı oranı uygular; 120 Hz'de 60 Hz'in iki katı hızlı döner.
 * Doğru biçim `1 - base^dt`: `base`, dönüşün **bir saniyede** ne kadarının KALDIĞIdır.
 */
export function smoothing(base: number, dt: number): number {
  return 1 - Math.pow(base, dt);
}

/**
 * Açılar için lerp.
 *
 * **Tuzak (a): düz `lerp` ±π'de kamerayı ters yöne fırlatır.** Farkı önce −π..π aralığına
 * indiriyoruz: her zaman KISA yoldan dönülür.
 *
 * **Tuzak (b): tam 180°'de iki dönüş yönü eşit uzaklıktadır.** Kayan nokta gürültüsü her karede
 * işaret değiştirir → kamera titrer ya da hiç dönmez. Beraberlik sabit olarak pozitif yöne bozulur.
 */
export function angLerp(a: number, b: number, t: number): number {
  let d = normalizeAngle(b - a);
  if (Math.abs(Math.abs(d) - Math.PI) < 1e-3) d = Math.PI * 0.999;
  return a + d * t;
}

/** Girdi vektöründen istenen yön. `0 = +z`, `π = −z`. */
export const wantedAngle = (ix: number, iz: number) => Math.atan2(ix, iz);
