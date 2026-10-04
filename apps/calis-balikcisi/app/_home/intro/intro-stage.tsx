'use client';

import { useEffect, useRef, useState } from 'react';

import { FISH_D, LOGO_VIEWBOX, WORD_D } from './logo-paths';
import s from './intro.module.css';

/** Perdenin açılmaya başladığı an ve açılış + kalkış süresi (CSS ile aynı). */
const EXIT_MS = 2950;
const OUT_MS = 820;
const FLY_EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
type IntroWindow = Window & { __introT0?: number; __introUnlock?: number };

/**
 * Açılış sahnesi. Kurgu CSS'te (sunucu HTML'iyle hemen başlar, JS beklemez); kaydırma kilidi
 * açılış betiğinde (kendi kalkar). Burada yalnız:
 * - logonun üst çubuktaki gerçek logoya uçuşu — ölçülü, Web Animations ile;
 * - "geç" (dokunma, tekerlek, tuş) — tek sefer, sonra dinleyiciler kalkar;
 * - bitince DOM'dan kalkma; sayfadan ayrılınca kilit ve işaret temizliği.
 * Zaman değişkenleri ana sayfa ağacında (`[data-home]`): sayfa değişince onunla gider.
 */
export function IntroStage() {
  const root = useRef<HTMLDivElement>(null);
  const lockup = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const w = window as IntroWindow;
    const el = root.current;
    const box = lockup.current;
    const elapsed = () => performance.now() - (w.__introT0 ?? 0);
    // görülmüş / hareket azaltılmış ya da hidrasyon açılış bittikten sonra geldi: kurma
    if (html.dataset.intro !== 'run' || !el || !box || elapsed() >= EXIT_MS + OUT_MS) {
      setGone(true);
      return;
    }
    const home = el.closest<HTMLElement>('[data-home]');

    const unlock = () => {
      window.clearTimeout(w.__introUnlock);
      delete html.dataset.introLock;
    };

    // Uçuş: logonun dönüşümsüz düzen kutusundan (.root sabit, 0,0) üst çubuktaki logoya
    let flight: Animation | null = null;
    const fly = (delay: number) => {
      const target = document.querySelector<HTMLElement>('[data-brand-logo]');
      if (!target || typeof box.animate !== 'function' || !box.offsetWidth) return;
      const b = target.getBoundingClientRect();
      if (!b.width) return;
      flight?.cancel();
      box.classList.add(s.flipjs ?? '');
      flight = box.animate(
        [
          { transform: 'none' },
          { transform: `translate3d(${b.left - box.offsetLeft}px, ${b.top - box.offsetTop}px, 0) scale(${b.width / box.offsetWidth})` },
        ],
        { duration: 800, delay, easing: FLY_EASE, fill: 'forwards' },
      );
    };
    if (elapsed() < EXIT_MS) fly(EXIT_MS - elapsed());

    let done = false;
    let attached = true;
    const inputs = ['pointerdown', 'wheel', 'touchmove', 'keydown'] as const;
    const detach = () => {
      if (!attached) return;
      attached = false;
      for (const t of inputs) window.removeEventListener(t, skip);
    };
    const finish = () => {
      if (done) return;
      done = true;
      detach();
      setGone(true);
    };
    // Geç: tek sefer — son kompozisyona atla, perde hemen açılsın, tıklamalar sayfaya geçsin
    function skip() {
      detach();
      const now = Math.round(elapsed());
      if (done || now >= EXIT_MS || !el) return;
      el.classList.add(s.skip ?? '');
      el.style.pointerEvents = 'none';
      el.style.setProperty('--exit', `${now}ms`);
      home?.style.setProperty('--intro', `${now + 100}ms`);
      fly(0);
      window.clearTimeout(w.__introUnlock);
      w.__introUnlock = window.setTimeout(unlock, OUT_MS);
    }
    for (const t of inputs) window.addEventListener(t, skip, { passive: true });

    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName.includes('rootOut')) finish();
    };
    el.addEventListener('animationend', onEnd);
    const fallback = window.setTimeout(finish, Math.max(0, EXIT_MS + OUT_MS + 200 - elapsed()));

    return () => {
      detach();
      el.removeEventListener('animationend', onEnd);
      window.clearTimeout(fallback);
      flight?.cancel();
      // StrictMode'un deneme temizliğinde sahne DOM'da kalır; gerçek ayrılışta (sayfa değişti)
      // kilit kalkar ve işaret "görüldü" olur — ana sayfaya geri dönünce tekrar oynamaz.
      window.setTimeout(() => {
        if (el.isConnected) return;
        unlock();
        if (html.dataset.intro === 'run') html.dataset.intro = 'seen';
      }, 0);
    };
  }, []);

  if (gone) return null;
  return (
    <div ref={root} className={s.root} aria-hidden="true">
      <div className={s.top}>
        <div className={s.glow} />
        <div className={s.sun} />
      </div>
      <div className={s.bottom}>
        <div className={s.glints}>
          <i className={s.glint} />
          <i className={s.glint} />
          <i className={s.glint} />
          <i className={s.glint} />
        </div>
      </div>
      <div className={s.horizon} />
      <div ref={lockup} className={s.lockup}>
        <svg className={s.word} viewBox={LOGO_VIEWBOX} focusable="false">
          <path d={WORD_D} fill="currentColor" />
        </svg>
        <svg className={s.fish} viewBox={LOGO_VIEWBOX} focusable="false">
          <path d={FISH_D} fill="currentColor" fillRule="evenodd" />
        </svg>
      </div>
      <div className={s.labels}>
        <span>Çalış Plajı · Fethiye</span>
        <span>2020&apos;den beri</span>
      </div>
    </div>
  );
}
