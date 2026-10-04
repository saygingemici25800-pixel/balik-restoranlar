// Zone bundle bekçisi (docs/zone-3d-modul.md bölüm 10–11, 14).
//
// `next build` sonrası çalışır:
//  1. Ana sayfanın (/) ilk yük chunk'larında (kök layout + sayfa) three / fiber / drei <Html> /
//     Zone kodu YOK.
//     (Sızıntı dolaylı da olur: kapının statik import zinciri — MANCH'te 215 → 319 kB oldu.)
//  2. Zone'un tembel chunk'ları (sahne kodu + fiber) gzip toplamı sınırın altında.
//     three ayrı ve paylaşılan bir chunk'ta (hero sahnesiyle ortak) — ayrıca raporlanır.
// Ölçemezse (build yok, chunk bulunamadı) YEŞİL BASMAZ: çıkış kodu 1.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

// `URL.pathname` boşluğu %20 yapar (proje yolu 'balik-restoranlar 3') — dosya yolu için fileURLToPath.
const APP = fileURLToPath(new URL('..', import.meta.url));
const NEXT = join(APP, '.next');
const ZONE_LIMIT_KB = 120;

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

const manifestPath = join(NEXT, 'app-build-manifest.json');
if (!existsSync(manifestPath)) fail('Build bulunamadı (.next/app-build-manifest.json). Önce `pnpm build`.');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
// '/' ilk yükü = kök layout + sayfa (+ çalışma zamanı kök dosyaları). Yalnız '/page'e bakmak,
// site kabuğundan (SiteChrome, Lenis, footer) gelen bir sızıntıyı yeşil geçirirdi.
const page = manifest.pages?.['/page'];
const layout = manifest.pages?.['/layout'];
if (!Array.isArray(page) || page.length === 0) fail('Ana sayfa chunk listesi okunamadı.');
if (!Array.isArray(layout) || layout.length === 0) fail('Kök layout chunk listesi okunamadı.');
const buildManifestPath = join(NEXT, 'build-manifest.json');
const rootMain = existsSync(buildManifestPath)
  ? (JSON.parse(readFileSync(buildManifestPath, 'utf8')).rootMainFiles ?? [])
  : [];
const home = [...new Set([...rootMain, ...layout, ...page])];

const SIGNATURES = {
  three: (t) => (t.match(/WebGLRenderer/g) ?? []).length > 3,
  fiber: (t) => t.includes('__r3f'),
  'drei-html': (t) => t.includes('zIndexRange'),
  zone: (t) => t.includes('zone-char') || t.includes('zone-tables') || t.includes('zone-diners') || t.includes('zone-strollers') || t.includes('zone-chat'),
};
const tagsOf = (text) => Object.entries(SIGNATURES).filter(([, test]) => test(text)).map(([k]) => k);
const gzKb = (buf) => gzipSync(buf, { level: 9 }).length / 1024;

// 1) ana sayfa ilk yük
let homeKb = 0;
const leaks = [];
for (const c of home.filter((f) => f.endsWith('.js'))) {
  const buf = readFileSync(join(NEXT, c));
  homeKb += gzKb(buf);
  const tags = tagsOf(buf.toString('utf8'));
  if (tags.length) leaks.push(`${c} → ${tags.join(', ')}`);
}

// 2) tüm chunk'lar: Zone + fiber + three
const all = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) all.push(p);
  }
};
walk(join(NEXT, 'static', 'chunks'));
let zoneKb = 0;
let threeKb = 0;
const zoneChunks = [];
for (const p of all) {
  const buf = readFileSync(p);
  const tags = tagsOf(buf.toString('utf8'));
  const rel = relative(NEXT, p);
  if (home.includes(rel)) continue;
  if (tags.includes('zone') || tags.includes('fiber')) {
    zoneKb += gzKb(buf);
    zoneChunks.push(`${rel} (${gzKb(buf).toFixed(1)} kB, ${tags.join(', ')})`);
  } else if (tags.includes('three')) {
    threeKb += gzKb(buf);
  }
}

console.log(`Ana sayfa ilk yük JS: ${homeKb.toFixed(1)} kB gz`);
console.log(`Zone tembel yük (sahne + fiber + drei Html): ${zoneKb.toFixed(1)} kB gz  [sınır ${ZONE_LIMIT_KB}]`);
zoneChunks.forEach((c) => console.log(`  · ${c}`));
console.log(`three (paylaşılan, tembel): ${threeKb.toFixed(1)} kB gz`);

if (leaks.length) fail(`Ana sayfaya sızıntı:\n  ${leaks.join('\n  ')}`);
if (zoneChunks.length === 0) fail('Zone chunk bulunamadı — ölçülemedi.');
if (zoneKb > ZONE_LIMIT_KB) fail(`Zone chunk sınırı aşıldı: ${zoneKb.toFixed(1)} > ${ZONE_LIMIT_KB} kB gz`);
console.log('✓ Ana sayfada three/fiber/Zone yok; Zone chunk sınırın altında.');
