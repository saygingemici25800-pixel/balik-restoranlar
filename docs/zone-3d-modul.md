# ZONE — Gezilebilir 3D Galeri Modülü (teknik yapı)

> MANCH'te yapılıp canlıya çıkan "Zone"un yeniden kullanılabilir özeti.
> Kaynak kod: `github.com/saygingemici25800-pixel/manch` · dal **`faz-1-yeniden`**
> · tam spec `docs/manch-zone-3d.md` · tek dosyalık prototip `docs/reference/manch-zone-prototype.html`.
> Bu dosya yeni projenin `docs/` klasörüne konup Claude Code'a verilebilir.

---

## 0. NE YAPIYOR

Sayfa statik kalır. Bir **kapı butonu** tam ekran, gezilebilir bir 3D galeri salonu açar.
Kullanıcı karakter seçer, salonda yürür, tabloların önündeki zemin halkasına basar, tabloya
girince **kamera tablonun karşısına süzülür ve içerik o çerçevenin içinde (bir pano kartında)
açılır.** Sayfa değişmez, Zone'dan çıkılmaz.

```
Kapı butonu → Karakter seçimi (sessionStorage'da hatırlanır)
  → Yükleyici (% sahne gerçekten kurulunca 100)
    → state:'zone'   yürü (joystick / WASD / ok tuşları)
       ├─ halkaya bas → prompt (başlık + GİR)
       │    └─ GİR / E → state:'pov' → kamera tabloya süzülür → pano kartı açılır
       │                  └─ GERİ / Esc → state:'zone' (kamera bıraktığı açıya döner)
       └─ ÇIKIŞ / Esc → kapanır
```

---

## 1. STACK VE KARARLAR

| | Değer |
|---|---|
| Çatı | Next.js 16 (App Router) · React 19.2 · TypeScript |
| 3D | `three` 0.186 · `@react-three/fiber` 9.7 · `@react-three/drei` 10.7 (**yalnız `<Html>`**) |
| State | Zustand 5 (durum makinesi) + modül seviyesi runtime nesnesi (kare başına durum) |
| i18n | next-intl (sahne içi metin `drei/<Html>` = normal DOM, TR karakter sorunu yok) |

`pnpm add three @react-three/fiber @react-three/drei` · `pnpm add -D @types/three`

| Karar | Neden |
|---|---|
| Sahne `next/dynamic` + `{ ssr:false }`, **yalnız kapı açılınca** yüklenir | three SSR'da patlar; ana sayfa bundle'ı ve LCP etkilenmez |
| **GLB/Blender yok** — geometri kod içi primitive (`box`, `plane`) | ~0 KB indirme, model/rig maliyeti yok |
| Dokular runtime'da `<canvas>` 2D ile üretilir | zemin, karo, duvar yazısı, ayak izi, halka, gölge — hepsi koddan |
| Karakter = **4 açılık sprite seti** (billboard düzlem) | 3D model yok, line-art kimliğe sadık |
| Gölge haritası **kapalı** | karakter altında canvas'tan yumuşak gölge düzlemi |
| Sipariş/sepet Zone'da **ayrı tutulmaz** | sitenin mevcut sepet store'una yazar, tek gönderme adaptörü |

---

## 2. DOSYA YAPISI (MANCH'te çalışan hâli)

```
src/
  store/zone.ts                 Zustand durum makinesi (aşağıda)
  lib/zone/
    frames.ts                   ★ TEK DOĞRULUK KAYNAĞI: çerçeve listesi + tüm sahne sabitleri
                                  + frameStop / promptAnchor / povTargets / fovForAspect
    angles.ts                   normalizeAngle · smoothing(1-base^dt) · angLerp (180° beraberlik bozma)
    runtime.ts                  kare başına dünya durumu + plain mutator'lar (stepWorld, readInput,
                                  setJoystick, consumeFootstep, releaseAllInput, resetRuntime)
    character.ts                sprite seti yükleme/önbellek (karakter başına), MASCOT_SPRITE_BASE
    capy.ts                     three'SİZ çizim + açı→görünüm eşlemesi (seçim ekranı bunu kullanır)
    textures.ts                 canvas doku üreticileri + trackTexture (sızıntı defteri)
    art.ts                      tablo görseli yükleme + placeholder
    order-rows.ts               sipariş tahtası satırları (menüden türetilir)
  hooks/
    useZoneControls.ts          klavye (WASD/ok/E/Esc), dinleyici HEP bağlı, tuş tuş süzülür
    useFollowCamera.ts          yön takipli kamera + POV + uyarlanır FOV
  components/zone/
    ZoneGate.tsx                kapı butonu + tam ekran perde (role=dialog), sahneyi dynamic yükler
    CharacterSelect.tsx         karakter seçimi (three içermez!)
    ZoneLoader.tsx              % sayacı + dönen mesajlar
    ZoneCanvas.tsx              <Canvas>, ışık, fog, dpr, SceneDisposer
    Hall.tsx                    zemin, tavan, 4 duvar (ön duvar dahil), süpürgelik, ışık bantları
    Frame.tsx / Frames.tsx      çerçeve (kutu + paspartu + görsel + spot bandı)
    FloorMarker.tsx             tablonun önündeki dönen halka + nabız
    FramePrompt.tsx             drei/<Html> prompt: başlık + GİR
    Character.tsx / Npc.tsx     oyuncu sprite'ı / seçilmeyen karakter (idle)
    Footprints.tsx              18'lik ayak izi havuzu
    Joystick.tsx                DOM joystick (Canvas DIŞINDA)
    FrameBoard.tsx              POV pano kartı (Canvas DIŞINDA)
    boards/OrderBoard.tsx       sipariş tahtası
    boards/StoryBoard.tsx       görsel + başlık + metin + "tam sayfaya git"
  lib/order/submit.ts           sipariş gönderme adaptörü (tek yol)
  lib/scroll-lock.ts            sayaçlı kaydırma kilidi
  app/[locale]/lab/zone/        geliştirme sahnesi (prod'da 404)
```

**Katman kuralı:** pencere olayları, joystick ve pano **`<Canvas>` dışında** DOM'da;
sahneye ait olan her şey içeride. Prompt sahne içinde ama `drei/<Html>` ile DOM.

---

## 3. DURUM MAKİNESİ — `store/zone.ts`

```ts
type ZoneState = "closed" | "select" | "loading" | "zone" | "pov"
//   closed → select → loading → zone ⇄ pov
//                                  └──→ closed
state, character, nearFrame, pov, progress, returnFocus
enter()        // karakter hatırlanıyorsa select'i atlar → loading
select(c)      // sessionStorage'a yazar → loading
setProgress(n) · ready()          // sahne gerçekten kurulunca 'zone'
setNearFrame(id|null)             // değişmediyse set etmez (gereksiz render yok)
openFrame(id)  // 'pov' + returnFocus = id
closeFrame()   // 'zone' — kamera açısına DOKUNMAZ
exit()
```

**Kare başına değişen hiçbir şey store'da değil** (60 render/sn olur) ve `useRef`/`useState`'te de
değil (React Compiler mutasyonu yasaklıyor). Yeri `lib/zone/runtime.ts`: modül seviyesinde tek
nesne + onu değiştiren plain fonksiyonlar. Sahne her kurulduğunda `resetRuntime()` alanları
**yerinde** sıfırlar.

---

## 4. SAHNE SABİTLERİ — `lib/zone/frames.ts`

```ts
HALF_W = 7.2            // salon x: -7.2..7.2
HALL_LEN = 40           // z: -20..20, ön duvar z=+20'de KAPALI
CEIL_H = 6
Z_MIN = -15, Z_MAX = 15 // yürünebilir aralık
CHAR_BOUND_X = HALF_W - 1
SPEED = 4.6             // birim/sn
CHAR_START = (0, 0.83, 12) · CAM_START_ANG = π (salonun dibine bakar)

CAM_DIST = 5.4 · CAM_HEIGHT = 2.45 · CAM_LERP = 0.09
LOOK_AHEAD = 3.0 · LOOK_HEIGHT = 1.55
TURN_BASE = 0.15        // kamera dönüşü: 180° ≈ 1.2 sn
CHAR_TURN_BASE = 0.002  // karakter dönüşü (kameradan hızlı — bölüm 6)

FOV_H_TARGET = 46 · FOV_MIN = 48 · FOV_MAX = 80   // bölüm 5.2
FRAME_PROXIMITY = 2.6   // prompt açılma yarıçapı
MARKER_SIZE = 4.6       // halka görünür yarıçapı 2.3 < 2.6 (bölüm 7.2)
PROMPT_HEIGHT = 1.35 · PROMPT_FORWARD = 0.9
POV_DISTANCE = 3.25 · POV_LERP = 0.055 · POV_HEIGHT = 2.65
```

Çerçeve listesi (yeni projede değişen asıl yer):

```ts
export const ZONE_FRAMES = [
  { id:'menu', side:-1, z:-4, kicker:'01 · SİPARİŞ', title:'SİPARİŞ VER', board:'order',
    art:'/burgers/on-tile/classic-manch.webp', href:'/menu' },
  { id:'crew', side: 1, z:-4, kicker:'02 · EKİP', title:'EL YAPIMI', board:'story', art:'…', href:'/about' },
  // side: -1 sol duvar, +1 sağ duvar · board: pano türü · href: pano altındaki "tam sayfaya git"
] as const
frameStop(f)    = [f.side * (HALF_W - 1.6), 0, f.z]           // yakınlık buna göre ölçülür
promptAnchor(f) = [f.side * (HALF_W - 0.12 - 0.9), 1.35, f.z] // CSS translate(-50%, 0)
povTargets(f)   = cam [fx - f.side*3.25, 2.65, f.z] · look [fx, 2.65, f.z]   (fx = f.side*(HALF_W-0.12))
```

Çerçeve 1.9 × 2.7, y = 2.65, üstünde 4.4 yüksekliğinde spot bandı.
**Aynı duvarda iki çerçeve arası ≥ 5.2 birim** olmalı (2 × 2.6) — yoksa tetikleme alanları çakışır.
MANCH'te 10 birim (z −4 ve 6). Daha çok çerçeve gerekiyorsa salon uzatılır (`HALL_LEN`, `Z_MIN/MAX`).

---

## 5. KAMERA — `useFollowCamera.ts` + `runtime.stepWorld()`

### 5.1 Yön takipli 3. şahıs

Kamera sabit bakmaz, **yürünen yöne döner**; karakter yana kaymaz, kamera arkasına geçer.

```ts
if (len > 0.05) {
  const want = Math.atan2(ix, iz)
  charAng = angLerp(charAng, want, 1 - Math.pow(CHAR_TURN_BASE, dt))               // hızlı
  if (!reducedMotion) camAng = angLerp(camAng, want, 1 - Math.pow(TURN_BASE, dt))  // yavaş
}
const fx = Math.sin(camAng), fz = Math.cos(camAng)
cx = clamp(char.x - fx*CAM_DIST, -(HALF_W-0.7), HALF_W-0.7)   // duvarın içine girmesin
cz = clamp(char.z - fz*CAM_DIST, -19.2, 19.2)
camera.position.lerp([cx, CAM_HEIGHT, cz], CAM_LERP)
camera.lookAt([char.x + fx*LOOK_AHEAD, LOOK_HEIGHT, char.z + fz*LOOK_AHEAD])
```

**Üç tuzak (üçü de yaşandı):**

```ts
// (a) düz lerp ±π'de ters yöne fırlatır → farkı -π..π'ye indir
// (b) tam 180°'de iki yön eşit → kamera titrer/dönmez → beraberliği sabit tarafa boz
function angLerp(a: number, b: number, t: number) {
  let d = normalizeAngle(b - a)
  if (Math.abs(Math.abs(d) - Math.PI) < 1e-3) d = Math.PI * 0.999
  return a + d * t
}
// (c) sabit katsayı (0.08) kare hızına bağımlı → 1 - base^dt kullan
const smoothing = (base: number, dt: number) => 1 - Math.pow(base, dt)
```

- Girdi bitince `camAng` yerinde kalır, kendiliğinden eski yönüne dönmez.
- `dt` 50 ms'te kırpılır (sekme dönüşünde ışınlanma olmasın).
- Kamera döndüğü için **ön duvar şart** — yoksa geri dönünce boşluğa bakılır.

### 5.2 Uyarlanır FOV (portre)

`fov` dikeydir; 48° dikey, 390×844'te yatayda ~23° = tünel. Yatay hedeflenir:

```ts
vFov = 2 * atan(tan(46°/2) / aspect)  →  clamp(48, 80)
```

Masaüstü 48'e takılır (değişmez), portre 80 (yan duvar tabloları %100 kadrajda).
Ekran boyu değişince yeniden uygulanır (R3F `aspect`'i günceller, `fov`'u değil).

### 5.3 POV

`camera.position.lerp(povTargets.cam, 0.055)` · `lookAt(povTargets.look)`. POV'da hareket girdisi
tamamen kapalı, `camAng` değişmez → çıkınca kamera bıraktığı yerden takibe devam eder.
Yarım geçişte Esc sorunsuz: iki dal da kameranın **o anki** konumundan lerp eder, mutlak atama yok.

---

## 6. KARAKTER

### 6.1 4 açılık sprite + billboard

```ts
const rel  = normalizeAngle(charAng - camAng)                    // -π..π
const i    = Math.min(4, Math.round(Math.abs(rel) / (Math.PI/4)))
const view = ['back','back34','side','front','front'][i]
sprite.material.map = SET[who][view]
sprite.scale.x = (rel < 0 && view !== 'back' && view !== 'front') ? -1 : 1   // sol taraf aynalanır
```

- **Billboard zorunlu:** sprite düzlemi her karede **yalnız Y ekseninde** kameraya döndürülür.
  Yapılmazsa (`PlaneGeometry` normali +z, materyal `FrontSide`) kamera 180° dönünce karakter
  **kaybolur**. Lean (`rotation.z`) önce, billboard açısı sonra (Euler XYZ).
- **`CHAR_TURN_BASE = 0.002` neden:** görünümü karakter–kamera **ayrışması** seçer. Tepe ayrışma
  `dönüş × max_t(TURN_BASE^t − CHAR_TURN_BASE^t)`. 0.02 → 47° (yalnız back/back34), 0.005 → 65°
  (`side` eşiği 67.5°'nin altında), **0.002 → 74° (`side` tetiklenir)**. `front` serbest
  gezinmede çıkmaz — seçim ekranı ve NPC için.
- Yürürken `bob += dt*11`, `y = 0.83 + |sin(bob)|*0.07`, `rotation.z = sin(bob)*0.05`; dururken lerp ile sıfır.
- Seçilmeyen karakter salonun dibinde NPC (front görünüm, idle, o da billboard). Sprite setleri
  **karakter başına** önbellekte (tekil olursa NPC ve oyuncu birbirinin dokusunu bırakır).

### 6.2 Sprite dosyaları

```
public/images/mascots/{ad}-back.png  {ad}-back34.png  {ad}-side.png  {ad}-front.png
```
Şeffaf PNG, ≥1000 px yükseklik, **dördünde aynı boy ve aynı zemin çizgisi** (yoksa dönerken
zıplar), `back34` ve `side` **sola** baksın (sağı kod aynalar). Çizim yokken geçici sprite koddan
çizilir; dosyalar gelince tek sabit değişir (`MASCOT_SPRITE_BASE`). **Otomatik yoklama yok** —
olmayan PNG'ye istek 404 üretir. Set **dördü birden** yüklenince değişir (yarım set zıplatır).

### 6.3 Ayak izi

18'lik havuz · her 0.26 sn · sağ/sol dönüşümlü · opaklık saniyede 0.28 söner · 0.22 × 0.3, opaklık 0.85.
Konum ve dönüş **hareket yönünden** (karakterin 0.25 arkası, 0.18 yana) — kamera yönünden değil.
Sayaç **girdiye değil gerçekten alınan yola** bakar (duvara dayanınca üst üste yığılmasın).
POV'da yeni iz basılmaz, mevcutlar sönmeye devam eder.

---

## 7. ÇERÇEVE ETKİLEŞİMİ

### 7.1 Yakınlık
Her karede karakterin `frameStop`'lara uzaklığı; en yakını `< 2.6` ise `setNearFrame(id)`.

### 7.2 Zemin halkası — `FloorMarker.tsx`
İki düzlem, `rotation.x = -π/2`, `depthWrite:false`:

| katman | y | davranış |
|---|---|---|
| halka (kesikli çember + 4 ok) | 0.014 | `rotation.z = -t*0.18` · opaklık `0.30 + glow*0.55` |
| nabız (tek halka) | 0.016 | ölçek 0.5→1.5 · opaklık `(1-ph)*(0.22+glow*0.5)` · hız `0.75+glow*0.85` |

`glow` yakın çerçevede 1'e, değilse 0'a yumuşar (`dt*6`). **Görünür yarıçap (2.3) tetikleme
yarıçapının (2.6) İÇİNDE** kalmalı — "halkanın üstündeyim ama açılmadı" olmasın. İkisi birlikte değişir.

### 7.3 Prompt
`drei/<Html>` ile `promptAnchor`'da; kutu **aşağı sarkar** (`translate(-50%, 0)`) → tablonun
alt kenarına binmez, halkayla tek çağrı gibi okunur. Görsel materyali **`transparent`** (alfalı PNG
yoksa düz blok çıkar). Görsel yüklenemezse placeholder doku.

### 7.4 Pano kartı — `FrameBoard.tsx`
Tam ekran DEĞİL; kenarlarda sahne görünür:
```
min(92vw, 720px) · max-height min(86vh, 900px) · dikey scroll
14px kenarlık + 6px %25 outline · gölge 0 40px 90px %45
giriş: opacity 0→1, scale .94→1, .45s cubic-bezier(.4,1.4,.7,.95)
sticky üst şerit: başlık + "← GERİ"
```
Pano türleri `board` alanıyla seçilir (`order`, `story`, yeni projede istenen başka tür).
Liste içeren panoda yeniden render'da **`scrollTop` korunur** (yoksa her tıkta başa sarar).

---

## 8. KONTROLLER

**Üçü aynı anda çalışır:** joystick + klavye + (tıklama ile GİR).

### 8.1 Joystick — her cihazda görünür (Canvas dışında)
```
sağ alt · right 22px + env(safe-area-inset-right) · bottom 30px + env(safe-area-inset-bottom)
taban 112px daire · topuz 50px · etiket "SÜRÜKLE" (mobilde gizli)
```
- Başlangıç joystick üzerinde (`mousedown`/`touchstart`); **`move`/`up` `window`'da** dinlenir
  (sürükleme pedden çıkınca kopmasın — klasik hata).
- Topuz ≤ `r−18`: `d = min(hypot(dx,dy), r-18)`, çıkış `cos(a)*d/(r-18)`, `sin(a)*d/(r-18)` → −1..1.
- Bırakınca merkeze döner; sürüklerken `transition:none`, sonra `.12s ease-out`.
- `window blur` sürüklemeyi bitirir. `touch-action:none`, `{ passive:false }` + `preventDefault()`.
- POV'da gizli. **`aria-hidden`** — klavye zaten global çalışıyor, ikinci kontrol sunulmaz.

### 8.2 Klavye
`WASD` + ok = yürüme · `E` = gir · `Esc` = POV'dan çık, değilse Zone'dan çık.
**Dinleyici hep bağlı, tuşlar duruma göre süzülür** (POV'da dinleyiciyi tümden kaldırmak Esc'i de
öldürür). POV'a geçerken basılı tuşlar bırakılır. Space/ok'ta `preventDefault()`.

### 8.3 Vektör
```ts
let ix = (right?1:0) - (left?1:0) + joy.x
let iz = (down?1:0)  - (up?1:0)   + joy.y
const len = Math.hypot(ix, iz); if (len > 1) { ix /= len; iz /= len }   // çapraz hızlı olmasın
```
**Girdi dünyaya göre, kameraya göre DEĞİL:** W hep −z, D hep +x. Kameraya göreli kontrol,
kamera dönerken yönü kaydırıp kafa karıştırıyor (bu bir oyun değil, galeri).

---

## 9. MEKÂN VE DOKULAR — `textures.ts`, `Hall.tsx`

| Yüzey | MANCH'te |
|---|---|
| Zemin | dama (128 px kare) `repeat(10,26)` + %6 grain · **anisotropy = cihaz maks. (16)** (moiré yok) |
| Yan duvarlar | karo (64 px grid) `repeat(6,3)` |
| Arka duvar | müze künyesi metni (i18n'den canvas'a) |
| Ön duvar (z=+20) | duvar yazısı — kamera döndüğü için ŞART |
| Tavan | `meshBasicMaterial` (standard materyal aşağı bakan yüzeyi **gri** gösterir) + iki ışık bandı |
| Süpürgelik | 0.12 × 0.35 kutu |

Işık: `ambient 0.85` + `directional #fff 0.55 @(4,10,6)` + `directional (marka mavisi) 0.35 @(-6,6,-8)`.
Fog: `new THREE.Fog(zeminRengi, 26, 52)`. Renkler **tokenlardan** okunur, koda hex gömülmez.

**Font tuzağı:** web fontu canvas'a geç yüklenir; ilk çizim yedek fontla kalır →
`await document.fonts.ready` sonra yazı içeren dokuları yeniden çiz (`needsUpdate = true`).

---

## 10. SİTEYLE ENTEGRASYON

- **Kapı:** `ZoneGate` perdeyi `fixed inset-0 z-100` açar (site nav/sepet/çerez bandının üstünde),
  `role="dialog"` + `aria-modal`, Esc, focus trap. İç yığın: canvas < prompt < joystick (70) <
  pano (75) < çıkış (90).
- **Dynamic import + `.catch()`:** iptal olan chunk isteği yakalanmamış redde dönmesin; sahne
  gelmezse perde boş kalır, ÇIKIŞ çalışır.
- **Sızıntı dersi:** sahneyi dynamic yüklemek yetmez — kapının **statik** import ettiği her modülün
  zincirine bak. MANCH'te seçim ekranı → `character.ts` → `three` zinciri ana sayfayı
  215 → 319 kB gz yaptı. Çözüm: three'siz kısmı ayrı modüle çıkar (`capy.ts`).
- **Sepet/sipariş:** Zone sitenin sepet store'una yazar. Gönderme tek adaptörde:
  `submitOrder(lines, locale, t)` · `orderChannel()` (uygun mu + **düğme metin anahtarı**) ·
  `orderTotal()`. Tüketici kanalı (WhatsApp vb.) bilmez; gerçek sipariş sistemi gelince değişen
  tek dosya adaptördür. Fiyatsız ürün (`price: null`) → "YAKINDA", eklenemez, toplama girmez.
- **Kaydırma kilidi sayaçlı** (`lib/scroll-lock.ts`): ilk `lock()` kilitler, son `unlock()` açar.
  İki ayrı "kaydet/geri yükle" kilidi (preloader + diyalog) birbirini ezip siteyi kilitli bırakmıştı.
- **i18n:** `<Html>` içeriği next-intl context'ini alır, ama `Zone` (ve panonun kullandığı)
  namespace sayfanın client mesajlarında olmalı — yoksa `MISSING_MESSAGE`.
- **Diğer animasyonlar** (footer vb.) perde açıkken `pause()`, kapanınca `resume()`.
- Karakter `sessionStorage`'da (`manch_char`); ikinci girişte seçim atlanır. Yalnız effect/handler'da okunur.

---

## 11. PERFORMANS (ölçülmüş)

| | MANCH sonucu |
|---|---|
| Zone chunk (three + fiber + drei) | **241.6 kB gz** (limit 260). Yükün ~tamamı three; drei `<Html>` ≈ 2.7 kB |
| Ana sayfa ilk yükleme / LCP | etkilenmedi (three ana bundle'da yok) |
| Kare hızı | masaüstü + mobil dpr3 + CPU 4× → boşta/yürürken/POV'da **60 fps** (M1 GPU; gerçek telefon GPU'su ölçülmedi) |
| Sahne | ~56 mesh · 21 doku |

- `dpr = Math.min(devicePixelRatio, 2)` · `gl={{ antialias:true, powerPreference:'high-performance' }}`
- Kare başına `new Vector3` yok (modül seviyesi çalışma nesnesi).
- **Kapanınca her şey dispose:** R3F JSX'le tanımlanan geometry/material'ı bırakır ama **elle
  üretilen canvas dokularını bırakmaz** → `SceneDisposer` sahneyi dolaşır, dokular `trackTexture`
  defterinde. Ölçüt: **aç-kapa-aç döngüsünde canlı doku sayısı sabit, kapalıyken 0.**
- POV'da render durmaz (kenarlarda sahne görünüyor) ama karakter animasyonu, yeni iz ve halka nabzı durur.
- Mobilde takılırsa `setPixelRatio(1.5)` yalnız **dolgu** darboğazında işe yarar, CPU'da değil.

---

## 12. ERİŞİLEBİLİRLİK VE SEO

- Pano açılınca odak panoya, kapanınca GİR butonuna döner. **`focus({ preventScroll:true })` şart**
  (yoksa sayfa kayar, kartın üstü kadrajdan çıkar). `<Html>` DOM'u sonradan portal ettiği için
  dönüş odağı birkaç kare `requestAnimationFrame` ile denenir.
- Sipariş `+`/`−` klavyeyle erişilebilir, `aria-label`'lı; toplam `aria-live="polite"`.
- **`prefers-reduced-motion`:** kamera hiç dönmez (`camAng` sabit), bob/lean/ayak izi yok, halka
  dönmez (yaklaşınca sabit vurgu), POV lerp'i ve perde animasyonu kapalı. Joystick çalışmaya devam eder.
- **Zone SEO'ya dahil değil.** Hedef sayfalar normal sayfa olarak kalır; sahne dışında `sr-only`
  linklerle de erişilir. Pano bu sayfaların yerine geçmez.

---

## 13. BİLİNEN TUZAKLAR (belirti → sebep → çözüm)

| Belirti | Sebep | Çözüm |
|---|---|---|
| Aşağı çekince kamera arkaya dönmüyor/titriyor | 180°'de iki yön eşit | `angLerp` beraberlik bozma |
| Kamera ±π'de ters yöne fırlıyor | düz lerp | farkı −π..π'ye indir |
| 120 Hz'de dönüş iki kat hızlı | sabit lerp katsayısı | `1 - base^dt` |
| 180° dönünce karakter kayboluyor | billboard yok, arka yüz kırpılıyor | her karede Y'de kameraya döndür |
| `side` görünümü hiç çıkmıyor | karakter dönüşü kameraya çok yakın | `CHAR_TURN_BASE` 0.002 |
| Portrede salon tünel gibi | dikey FOV sabit | yatay 46° hedefle, clamp 48–80 |
| Halkanın üstünde prompt açılmıyor | görünür yarıçap ≥ tetikleme | 2.3 < 2.6 |
| Prompt tablonun üstüne biniyor | yukarı büyüyen kutu + yanlış çapa | duvardan 0.9 önde, `translate(-50%,0)` |
| Alfalı tablo düz renk blok | materyal `transparent` değil | `transparent: true` |
| Duvar yazısı yanlış fontla | canvas fontu geç yükleniyor | `document.fonts.ready` → yeniden çiz |
| Tavan gri | standard materyal, yalnız ambient | `meshBasicMaterial` |
| Zemin uzakta titriyor | düşük anisotropi | cihaz maksimumu |
| Geri dönünce boşluk | ön duvar yok | z=+20 duvar |
| POV'da Esc çalışmıyor | POV'da dinleyici tümden kaldırıldı | dinleyici hep bağlı, tuş tuş süz |
| Joystick sürüklerken kopuyor | `move` eleman üstünde dinleniyor | `window`'da dinle |
| Joystick görünmüyor | site sepet düğmesinin (z-60) altında | perde z-100 + iç yığın |
| Pano açılınca sayfa kayıyor | `focus()` kaydırıyor | `preventScroll:true` |
| three ana sayfaya sızdı | statik import zinciri | three'siz modülü ayır, bundle bekçisi |
| Kapanınca site kaydırılamıyor | iki ayrı overflow kilidi | sayaçlı kilit |
| Bellek aç-kapa'da artıyor | elle üretilen doku dispose edilmiyor | disposer + doku defteri |
| Sipariş listesi her tıkta başa sarıyor | yeniden render | `scrollTop`'u koru |
| Mobil ölçü kuralı çalışmıyor | satır içi `style` sınıfı ezer | ölçüyü tamamen sınıfla ver |
| Kare-başına durumda lint hatası | React Compiler mutasyon yasağı | `runtime.ts` modülü |
| Prod konsolunda `THREE.Clock` uyarısı | fiber 9.7 kendi içinde Clock kuruyor | kütüphane kaynaklı, kabul edildi |

---

## 14. TEST / BEKÇİLER (MANCH `scripts/`)

| Script | Ne doğrular |
|---|---|
| `zone-camera-check.mjs` | açı tuzakları · 4 yön · 180° · billboard · aynalama · reduced-motion · portre ölçüleri |
| `zone-leak-check.mjs` | **aynı sayfada** aç/kapa döngüsü: bağlam/canvas/doku sayısı sabit, kapalıyken 0 |
| `zone-bundle-check.mjs` | three ana bundle'da yok + Zone chunk boyutu (ölçemezse yeşil basmaz) |
| `zone-perf-check.mjs` | kare hızı, POV donması (önce boş sayfada rAF tavanı; < 55 ise puanlamaz) |
| `zone-walkthrough.mjs` | gözle bakma için uçtan uca ekran görüntüsü zinciri |

Debug kancaları (yalnız dev): `window.__ZONE__` (store) · `__ZONE_STATS__()` (**`meshes` bir dizi**) ·
`__ZONE_TEXTURES__()` (`{created, disposed, alive}`) · runtime `debug.simTime` / `peakSpread` / `seenViews`.

**Ölçüm dersleri:** süreyi duvar saatiyle değil **simülasyon saatiyle** ölç (`dt` kırpılınca dünya
yavaşlar) · kare içi tepe değerini `page.evaluate` ile örnekleme, döngü biriktirsin · sızıntıyı
navigasyonla ölçme (sayaçlar sıfırlanır) · her kontrolü bir kez bilerek boz, yakalıyor mu bak ·
otomatik kontroller yeşilken de **gözle bak** (joystick z-index, alfa blok, gri tavan hep gözle bulundu).

---

## 15. YENİ PROJEYE UYARLAMA

**Değişecekler**
- `lib/zone/frames.ts` → `ZONE_FRAMES` (sayı, duvar, z, pano türü, görsel, href); çok çerçevede salon boyu
- Pano bileşenleri → `boards/*` (sipariş yoksa `OrderBoard` ve adaptör çıkar)
- Karakterler → isimler, 4 açılık sprite'lar, `CHAR_KEY`, seçim ekranı
- `textures.ts` → zemin/duvar deseni, duvar yazıları; renkler yeni projenin tokenlarından
- i18n `Zone` namespace metinleri, kapı butonu tasarımı

**Dokunulmayacaklar (kanıtlanmış)**
`angles.ts` · `runtime.ts` (stepWorld/readInput) · `useFollowCamera` · `useZoneControls` ·
`Joystick` · halka/tetikleme oranı · prompt çapası · disposer + doku defteri · sayaçlı kilit ·
dynamic import kalıbı · odak yönetimi

**Önerilen adım sırası** (MANCH'te işleyen)
1. bağımlılıklar + store + frames + textures
2. `ZoneCanvas` + `Hall` (lab sayfasında boş salon)
3. karakter + kontroller + yön takipli kamera
4. ayak izi + NPC + ışık bantları
5. çerçeveler + halka + prompt + yakınlık
6. POV geçişi + pano kabuğu (odak gidiş-dönüşü)
7. joystick
8. pano içerikleri
9. kapı + karakter seçimi + yükleyici → sayfaya bağla
10. performans ölçümü + mobil/masaüstü gözle bakma

**Kabul:** build temiz · Zone chunk limit içinde · ana sayfa LCP bozulmadı · aç-kapa-aç'ta bellek
sabit · kamera yürünen yöne dönüyor, 180°'de fırlamıyor, duvara girmiyor · halkaya basınca prompt
kesin açılıyor · POV'a girip çıkmak kamerayı bozmuyor · joystick fareyle çalışıyor, ped dışına
çıkınca kopmuyor · tüm panolar doğru içeriği açıyor.
