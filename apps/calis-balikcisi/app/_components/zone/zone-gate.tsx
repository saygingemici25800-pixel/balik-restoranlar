'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';

import type { ZoneCanvasProps } from '@/app/_components/zone/zone-canvas';
import { CONTACT } from '@/lib/constants';
import { lockScroll, unlockScroll } from '@/lib/scroll-lock';
import { useZoneStore } from '@/lib/zone/store';
import { ZoneLoader } from './zone-loader';

/**
 * Zone kapısı (docs/zone-3d-modul.md bölüm 10): hero'daki "Terası Gez" düğmesi + tam ekran perde.
 *
 * Ana sayfa bundle'ı: bu dosya `three`/fiber import ETMEZ (yalnız React, store, kilit, tip).
 * Sahne `next/dynamic` + `ssr:false` ile YALNIZ kapı açılınca iner; chunk inmezse perde boş
 * kalmaz, ÇIK çalışır (`.catch`).
 *
 * Perde `document.body`'ye portal: hero `relative z-0` bir stacking context açıyor, içinde
 * `z-[100]` bile hapsolurdu. `role="dialog"` + `aria-modal`, odak perdede kalır, Esc çıkarır
 * (POV'dayken Esc yalnız panoyu kapatır — `defaultPrevented`). Açıkken sayfa kaydırması ve Lenis
 * durur, hero sahnesi (`calis:zone` olayı) duraklar. Kapanınca odak düğmeye döner.
 */

/**
 * Sahne chunk'ı inmezse yerine geçen yedek. Hazır sinyalini KENDİSİ verir (mount'ta): `next/dynamic`
 * yükleyiciyi `React.lazy` ile önbelleğe alır, `.catch` yalnız ilk hatada çalışır — sonraki
 * açılışlarda yükleyici %15'te asılı kalmasın. Store'a yükleyici sözünden yazılmaz: kullanıcı
 * yüklenirken çıktıysa geç gelen hata perdeyi kendiliğinden yeniden AÇMAZ (inceleme).
 */
function SceneUnavailable({ onReady }: ZoneCanvasProps) {
  useEffect(() => {
    // sahne yok: karakter sorulmaz, yedek bağlantılar hemen görünür (choose yalnız yüklenirken işler)
    const z = useZoneStore.getState();
    z.choose(z.hero);
    onReady?.();
  }, [onReady]);
  return <Fallback reason="Sahne yüklenemedi." />;
}

/** Hata sonrası bir sonraki açılışta chunk yeniden denensin diye bileşen yeniden kurulur. */
let sceneFailed = false;
const loadScene = () =>
  dynamic<ZoneCanvasProps>(
    () =>
      import('@/app/_components/zone/zone-canvas')
        .then((m) => {
          if (useZoneStore.getState().state === 'loading') useZoneStore.getState().setProgress(70);
          return m.ZoneCanvas;
        })
        .catch((): ComponentType<ZoneCanvasProps> => {
          sceneFailed = true;
          return SceneUnavailable;
        }),
    { ssr: false, loading: () => null },
  );
let ZoneCanvas = loadScene();

/** WebGL yoksa sahne yerine önemli sayfalara bağlantılar (bölüm 12: sahne SEO'ya dahil değil). */
function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Hero sahnesi (HeroCanvas) bu olayı dinler: perde açıkken çizimi durdurur. Hero perdeden SONRA
 * da kurulabilir (yavaş ağda tembel chunk) — olayı kaçırırsa durumu `<html data-zone>`'dan okur.
 */
const announce = (open: boolean) => {
  if (open) document.documentElement.dataset.zone = 'open';
  else delete document.documentElement.dataset.zone;
  window.dispatchEvent(new CustomEvent('calis:zone', { detail: { open } }));
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SKIP_LINK =
  'sr-only focus:not-sr-only focus:absolute focus:bottom-6 focus:left-1/2 focus:z-[95] focus:-translate-x-1/2 focus:rounded-full focus:border focus:border-accent focus:bg-bg focus:px-5 focus:py-2.5 focus:text-sm focus:uppercase focus:tracking-[0.14em] focus:text-fg focus:outline-none focus:ring-2 focus:ring-accent';

const DEFAULT_TRIGGER =
  'inline-flex items-center gap-2 border border-fg/70 bg-bg/30 px-8 py-3.5 text-sm uppercase tracking-[0.18em] text-fg backdrop-blur-sm transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

/** Kapı düğmesinin görünümü sayfaya göre değişebilir; perde, odak, kilit mantığı aynı kalır. */
type ZoneGateProps = {
  label?: string;
  badge?: string;
  className?: string;
  badgeClassName?: string;
  arrowClassName?: string;
};

export function ZoneGate({
  label = 'Terası Gez',
  badge,
  className = DEFAULT_TRIGGER,
  badgeClassName = '',
  arrowClassName = '',
}: ZoneGateProps = {}) {
  const state = useZoneStore((s) => s.state);
  const enter = useZoneStore((s) => s.enter);
  const exit = useZoneStore((s) => s.exit);
  const ready = useZoneStore((s) => s.ready);
  const chosen = useZoneStore((s) => s.chosen);
  const trigger = useRef<HTMLButtonElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(true);
  const open = state !== 'closed';

  const onOpen = useCallback(() => {
    if (sceneFailed) {
      sceneFailed = false;
      ZoneCanvas = loadScene();
    }
    const ok = hasWebGL();
    setWebgl(ok);
    enter();
    useZoneStore.getState().setProgress(15);
    // WebGL yoksa sahne kurulmayacak: seçim sorulmaz, yedek bağlantılar hemen görünsün.
    if (!ok) {
      const z = useZoneStore.getState();
      z.choose(z.hero);
      ready();
    }
  }, [enter, ready]);

  // Kapı sayfadan kalkarsa (perde açıkken gezinme) Zone kapanır: geri dönünce kendiliğinden açılmasın.
  useEffect(() => () => useZoneStore.getState().exit(), []);

  // Açıkken: kaydırma kilidi + Lenis, hero sahnesi duraklar; kapanınca hepsi geri, odak düğmeye.
  useEffect(() => {
    if (!open) return;
    const btn = trigger.current;
    lockScroll();
    announce(true);
    curtain.current?.focus({ preventScroll: true });
    return () => {
      unlockScroll();
      announce(false);
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  // Karakter seçilince seçim düğmesi DOM'dan kalkar; odak <body>'ye düşmesin, perdeye döner.
  useEffect(() => {
    const el = curtain.current;
    if (!open || !chosen || !el) return;
    const a = document.activeElement;
    if (!a || a === document.body || !el.contains(a)) el.focus({ preventScroll: true });
  }, [open, chosen]);

  // Esc: Zone'dan çık. POV'da kontrol hook'u Esc'i panoyu kapatmak için kullanır (`defaultPrevented`).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const s = useZoneStore.getState().state;
      if (s === 'zone' || s === 'loading') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, exit]);

  // Tab perdenin iki ucunda döner: odak bir adım bile sayfaya (BODY) kaçmasın.
  const wrapTab = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = curtain.current;
    if (e.key !== 'Tab' || !el || e.defaultPrevented) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && (active === first || active === el)) {
      e.preventDefault();
      last.focus();
    }
  }, []);

  // Odak perdenin dışına çıkamaz (aria-modal): dışarıda odaklanan öğe olursa perde geri alır.
  useEffect(() => {
    const el = curtain.current;
    if (!open || !el) return;
    const keepInside = (e: FocusEvent) => {
      const t = e.target;
      if (t instanceof Node && !el.contains(t)) el.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', keepInside);
    return () => document.removeEventListener('focusin', keepInside);
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={onOpen}
        data-testid="zone-gate-open"
        aria-haspopup="dialog"
        className={className}
      >
        {label}
        {badge ? <span className={badgeClassName}>{badge}</span> : null}
        <span aria-hidden="true" className={arrowClassName}>→</span>
      </button>
      {open
        ? createPortal(
            <div
              ref={curtain}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Çalış Balıkçısı — terası gez"
              data-testid="zone-curtain"
              // Lenis durdurulmuşken tekerlek/dokunma olaylarını iptal eder; perde içi (pano
              // kartının kendi kaydırması) bundan muaf. Arka sayfayı `overflow:hidden` tutar.
              data-lenis-prevent=""
              onKeyDown={wrapTab}
              className="fixed inset-0 z-[100] bg-bg text-fg outline-none motion-safe:animate-zone-board-in"
            >
              {/* DOM sırası = görsel sıra (WCAG 2.4.3): başlık ve Çık sahneden ÖNCE — Tab önce
                  Çık'a, sonra sahnenin düğmelerine (Konuşmalar, pano) gider. Konum `absolute`. */}
              {/* Kendi zemini var: sahnenin açık yüzeyleri (tavan, lameller) üstünde de AA okunur. */}
              <div className="pointer-events-none absolute left-4 top-4 z-[90] max-w-[60vw] rounded-md bg-bg/80 px-3 py-2 backdrop-blur-sm md:left-6 md:top-6">
                <p className="font-display text-2xl text-fg md:text-3xl">Çalış Balıkçısı</p>
                <p className="mt-1 text-xs text-fg/80 max-md:hidden">
                  WASD / oklar ya da joystick · panolara yaklaşıp E · merdiven vitrinin yanındaki kapıda
                </p>
              </div>
              <button
                type="button"
                onClick={exit}
                data-testid="zone-exit"
                className="absolute right-4 top-4 z-[90] rounded-full border border-fg/70 bg-bg/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-fg backdrop-blur-sm transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:right-6 md:top-6"
              >
                Çık <span className="max-md:hidden">· Esc</span>
              </button>
              {webgl ? (
                <ZoneCanvas className="h-full w-full" onReady={ready} />
              ) : (
                <Fallback reason="Bu tarayıcı 3D sahneyi açamıyor." />
              )}
              <ZoneLoader />
              {/* Sahne SEO'ya dahil değil; aynı hedefler sahne dışında da erişilir (bölüm 12).
                  Klavyeyle odaklanınca görünür olur (WCAG 2.4.7). */}
              <nav aria-label="Zone bağlantıları">
                <Link href="/menu" onClick={exit} className={SKIP_LINK}>Menü</Link>
                <Link href="/iletisim" onClick={exit} className={SKIP_LINK}>İletişim</Link>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Fallback({ reason }: { reason: string }) {
  const exit = useZoneStore((s) => s.exit);
  return (
    <div className="grid h-full w-full place-items-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <p className="text-lg text-fg">{reason}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/menu" onClick={exit} className="rounded-full border border-accent px-5 py-2.5 text-sm uppercase tracking-[0.14em] text-accent">
            Menü
          </Link>
          <Link href="/iletisim" onClick={exit} className="rounded-full border border-accent px-5 py-2.5 text-sm uppercase tracking-[0.14em] text-accent">
            İletişim
          </Link>
          <a href={CONTACT.mobileHref} className="rounded-full border border-accent px-5 py-2.5 text-sm uppercase tracking-[0.14em] text-accent">
            Ara · {CONTACT.mobile}
          </a>
        </div>
      </div>
    </div>
  );
}
