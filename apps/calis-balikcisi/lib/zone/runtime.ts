/**
 * Zone'un kare-başına değişen durumu ve onu değiştiren plain fonksiyonlar
 * (docs/zone-3d-modul.md bölüm 3). MANCH'ten aynen alındı; dokunulmaz.
 *
 * Neden Zustand değil: bunlar her karede değişir; store'a yazmak saniyede 60 render demek olur.
 * Neden `useRef`/`useState` de değil: kare başına mutasyon bileşenin içinde değil, bu modülün
 * fonksiyonlarında olur. Zone tam ekran ve tekildir; modül seviyesinde tek dünya durumu doğru
 * modeldir. `resetRuntime()` sahne her kurulduğunda alanları YERİNDE sıfırlar.
 *
 * MANCH'ten farklar: ayak izi üretimi yok (Faz 1); masa/duvar/saksılara çarpışma var
 * (`resolveObstacles`, Faz 2); iki kat var — karakter bir kattadır, sınırlar ve engeller kata
 * göre; merdiven geçidi `travelTo` ile diğer kata ışınlar (video revizyonu).
 */
import { angLerp, smoothing, wantedAngle } from '@/lib/zone/angles';
import type { CharView } from '@/lib/zone/figure';
import {
  CHAR_RADIUS,
  CHAR_TURN_BASE,
  type Level,
  SPEED,
  TURN_BASE,
  WALK_BOUNDS,
} from '@/lib/zone/frames';
import { OBSTACLES } from '@/lib/zone/venue-layout';

export type ZoneRuntime = {
  /**
   * Karakterin konumu, baktığı yön ve yürüme fazı. `y` kat zemininden yüksekliktir (bob dahil);
   * dünya yüksekliği `LEVEL_Y[level] + y`.
   */
  char: { x: number; y: number; z: number; ang: number; bob: number; level: Level };
  /** Kamera bir sonraki karede lerp etmeden yerine geçsin (katlar arası geçiş). */
  snapCamera: boolean;
  /** Kameranın baktığı yön (radyan; 0 = +z, π = −z). Karakterden YAVAŞ döner. */
  cam: { ang: number };
  /** Bu karenin normalize edilmiş girdi vektörü (bölüm 8.3). */
  input: { ix: number; iz: number; len: number };
  /** Joystick çıktısı −1..1. */
  joy: { x: number; y: number };
  /** Basılı tuşlar: `e.code`, küçük harf. */
  keys: Set<string>;
  /** Yalnızca gözlem: sahne yazar, lab/QA okur. */
  debug: {
    view: CharView;
    mirrored: boolean;
    source: 'drawn' | 'png';
    /** Sıfırlamadan bu yana en büyük karakter–kamera ayrışması (radyan). */
    peakSpread: number;
    seenViews: Record<CharView, boolean>;
    /** Sıfırlamadan bu yana biriken SİMÜLASYON süresi (sn) — duvar saati değil. */
    simTime: number;
  };
};

/**
 * Başlangıç: zemin kat dış teras, orta koridor (sahil girişi hizası), 1. ve 2. masa sıraları
 * arasındaki geçit. Kamera 5.4 geride (z ≈ −4.1), cephenin önünde, şemsiyelerin dışında:
 * ilk kare masaları, saksı sınırını, sahil yolunu, denizi ve gün batımını gösterir.
 */
export const CHAR_START = { x: 0, y: 0.83, z: -9.5, level: 0 as Level } as const;

/**
 * Başlangıç bakışı **−z**: denize ve gün batımına. `wantedAngle(0,-1) === π` olduğu için
 * "ileri yürümek" (W) açıyı değiştirmez; kamera ilk karede yerinden oynamaz.
 */
export const CAM_START_ANG = Math.PI;

const runtime: ZoneRuntime = {
  char: { x: CHAR_START.x, y: CHAR_START.y, z: CHAR_START.z, ang: CAM_START_ANG, bob: 0, level: CHAR_START.level },
  snapCamera: false,
  cam: { ang: CAM_START_ANG },
  input: { ix: 0, iz: 0, len: 0 },
  joy: { x: 0, y: 0 },
  keys: new Set<string>(),
  debug: {
    view: 'back',
    mirrored: false,
    source: 'drawn',
    peakSpread: 0,
    seenViews: { back: false, back34: false, side: false, front: false },
    simTime: 0,
  },
};

/** Okumak serbest; yazmak yalnızca aşağıdaki fonksiyonlarla. */
export const zoneRuntime = (): Readonly<ZoneRuntime> => runtime;

/** Sahne her kurulduğunda: nesnenin KİMLİĞİ korunur, alanları yerinde sıfırlanır. */
export function resetRuntime() {
  runtime.char.x = CHAR_START.x;
  runtime.char.y = CHAR_START.y;
  runtime.char.z = CHAR_START.z;
  runtime.char.ang = CAM_START_ANG;
  runtime.char.bob = 0;
  runtime.char.level = CHAR_START.level;
  runtime.snapCamera = false;
  runtime.cam.ang = CAM_START_ANG;
  runtime.input.ix = 0;
  runtime.input.iz = 0;
  runtime.input.len = 0;
  runtime.joy.x = 0;
  runtime.joy.y = 0;
  runtime.keys.clear();
  runtime.debug.view = 'back';
  runtime.debug.mirrored = false;
  resetZoneDebug();
}

/** Dev/QA: karakteri bir noktaya taşır (yakınlık testleri yürümeden ölçülür). */
export function teleport(x: number, z: number, level?: Level) {
  if (level !== undefined) runtime.char.level = level;
  runtime.char.x = x;
  runtime.char.z = z;
  resolveObstacles();
}

/**
 * Katlar arası geçiş (merdiven): karakter diğer kata, varış noktasına ışınlanır; karakter ve
 * kamera aynı yöne bakar, kamera bir sonraki karede lerp etmeden yerine geçer (kararma perdesinin
 * arkasında olur — kullanıcı kayma görmez).
 */
export function travelTo(level: Level, x: number, z: number, ang: number) {
  runtime.char.level = level;
  runtime.char.x = x;
  runtime.char.z = z;
  runtime.char.ang = ang;
  runtime.cam.ang = ang;
  runtime.keys.clear();
  runtime.joy.x = 0;
  runtime.joy.y = 0;
  resolveObstacles();
  runtime.snapCamera = true;
}

/** Kamera hook'u çağırır: snap isteği varsa bir kez döner ve temizlenir. */
export function consumeCameraSnap(): boolean {
  const s = runtime.snapCamera;
  runtime.snapCamera = false;
  return s;
}

/* ---------------------------------- girdi ---------------------------------- */

export const pressKey = (k: string) => {
  runtime.keys.add(k);
};
export const releaseKey = (k: string) => {
  runtime.keys.delete(k);
};

/**
 * Tuşları ve joystick'i bırakır. Sekme değişince / pencere odağı gidince tuş "basılı kalır"
 * ve karakter kendiliğinden yürür — `blur` bunu çağırır.
 */
export function releaseAllInput() {
  runtime.keys.clear();
  runtime.joy.x = 0;
  runtime.joy.y = 0;
}

/** `Joystick` çağırır. Değerler −1..1. */
export function setJoystick(x: number, y: number) {
  runtime.joy.x = x;
  runtime.joy.y = y;
}

/** `e.code` değerleri, küçük harf (fiziksel tuş konumu — `use-zone-controls`). */
const LEFT = ['keya', 'arrowleft'];
const RIGHT = ['keyd', 'arrowright'];
const UP = ['keyw', 'arrowup'];
const DOWN = ['keys', 'arrowdown'];

const held = (list: string[]) => list.some((k) => runtime.keys.has(k));

/**
 * Bu karenin girdi vektörü. Klavye ve joystick TOPLANIR, sonra 1'e normalize edilir —
 * çapraz yürürken hızlanmayı bu engeller.
 *
 * **Girdi dünyaya göredir, kameraya göre değil (bölüm 8.3):** `W` her zaman −z (deniz),
 * `D` her zaman +x (cephe). Kamera yönü yalnızca görüntüyü belirler.
 */
export function readInput() {
  let ix = (held(RIGHT) ? 1 : 0) - (held(LEFT) ? 1 : 0) + runtime.joy.x;
  let iz = (held(DOWN) ? 1 : 0) - (held(UP) ? 1 : 0) + runtime.joy.y;
  let len = Math.hypot(ix, iz);
  if (len > 1) {
    ix /= len;
    iz /= len;
    len = 1;
  }
  runtime.input.ix = ix;
  runtime.input.iz = iz;
  runtime.input.len = len;
  return runtime.input;
}

/* -------------------------------- simülasyon -------------------------------- */

/** Joystick merkeze dönerken kalan gürültü kamerayı oynatmasın. */
const MOVING = 0.05;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Çarpışma (Faz 2): karakter masa+sandalye izlerine, çatı dikmelerine ve saksılara girmez.
 *
 * Her engel eksen hizalı kutu; karakter yarıçapı kadar büyütülür. Karakter içerideyse EN AZ
 * girdiği eksenden dışarı itilir — kenar boyunca kayma kendiliğinden olur, köşede takılmaz.
 * Adım başına en fazla `SPEED × 0.05 = 0.23` birim yol var; en dar kutu bundan geniş olduğu
 * için içinden geçme (tünelleme) olmaz. İki geçiş: iki kutunun arasına itilen karakter
 * ikincisinden de çıkar. Sonda sınırlara yeniden kırpılır.
 */
export function resolveObstacles() {
  const { char } = runtime;
  const b = WALK_BOUNDS[char.level];
  for (let pass = 0; pass < 2; pass++) {
    for (const o of OBSTACLES[char.level]) {
      const dx = char.x - o.x;
      const dz = char.z - o.z;
      const px = o.hx + CHAR_RADIUS - Math.abs(dx);
      if (px <= 0) continue;
      const pz = o.hz + CHAR_RADIUS - Math.abs(dz);
      if (pz <= 0) continue;
      if (px < pz) char.x += (dx < 0 ? -1 : 1) * px;
      else char.z += (dz < 0 ? -1 : 1) * pz;
    }
  }
  char.x = clamp(char.x, b.xMin, b.xMax);
  char.z = clamp(char.z, b.zMin, b.zMax);
}

/**
 * Bir simülasyon adımı: girdi → konum → **iki açı**. Kare başına tam bir kez çağrılır.
 *
 * `char.ang` ve `cam.ang` aynı `want` hedefinden, aynı karede, farklı hızlarda döner.
 * Aradaki fark sprite'ın hangi açıdan çizileceğini belirler (bölüm 6.1).
 */
export function stepWorld(dt: number, reduced: boolean) {
  runtime.debug.simTime += dt;
  const { ix, iz, len } = readInput();
  const { char, cam } = runtime;

  // yürüme: dünya eksenlerinde, bulunulan katın sınırları içinde; masalar/duvarlar/saksılar katı
  const b = WALK_BOUNDS[char.level];
  char.x = clamp(char.x + ix * SPEED * dt, b.xMin, b.xMax);
  char.z = clamp(char.z + iz * SPEED * dt, b.zMin, b.zMax);
  resolveObstacles();

  if (len > MOVING) {
    const want = wantedAngle(ix, iz);
    // Karakter HIZLI döner — basar basmaz o yöne bakar.
    char.ang = angLerp(char.ang, want, smoothing(CHAR_TURN_BASE, dt));
    // Kamera YAVAŞ döner (180° ≈ 1.2 sn). reduced-motion: kamera HİÇ dönmez.
    if (!reduced) cam.ang = angLerp(cam.ang, want, smoothing(TURN_BASE, dt));
  }
  // Girdi bitince `cam.ang` yerinde kalır — kamera kendi kendine eski yönüne DÖNMEZ.

  // bob: yürürken hafif zıplama (bölüm 6.1)
  if (len > MOVING && !reduced) {
    char.bob += dt * 11;
    char.y = CHAR_START.y + Math.abs(Math.sin(char.bob)) * 0.07;
  } else {
    char.y += (CHAR_START.y - char.y) * 0.2;
  }

  return {
    moving: len > MOVING,
    lean: len > MOVING && !reduced ? Math.sin(char.bob) * 0.05 : null,
  };
}

/** Sahne ekrandaki sprite'ı buraya bildirir; `__ZONE_STATS__` okur. */
export function reportSprite(
  view: CharView,
  mirrored: boolean,
  source: 'drawn' | 'png',
  spread: number,
) {
  runtime.debug.view = view;
  runtime.debug.mirrored = mirrored;
  runtime.debug.source = source;
  const abs = Math.abs(spread);
  if (abs > runtime.debug.peakSpread) runtime.debug.peakSpread = abs;
  runtime.debug.seenViews[view] = true;
}

/** Test, bir ölçüm penceresine başlarken çağırır. */
export function resetZoneDebug() {
  runtime.debug.peakSpread = 0;
  runtime.debug.simTime = 0;
  runtime.debug.seenViews = { back: false, back34: false, side: false, front: false };
}
