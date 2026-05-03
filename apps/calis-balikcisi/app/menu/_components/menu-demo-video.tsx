'use client';

import { useEffect, useRef, useState } from 'react';

export function MenuDemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduceMotion) {
      video.pause();
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio >= 0.5) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.5] },
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, [reduceMotion]);

  return (
    <section className="px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">
            Deneyim
          </p>
          <p className="font-display italic text-2xl text-fg/80 mt-3">
            Tabaklara dokunarak keşfedin
          </p>
        </div>

        <div className="relative">
          <div className="bg-fg/10 rounded-t-xl pt-3 px-3 pb-2">
            <div className="relative aspect-[16/10] rounded-t-md overflow-hidden bg-fg/5">
              <video
                ref={videoRef}
                src="/videos/menu-demo.mp4"
                muted
                loop
                playsInline
                preload="metadata"
                controls={reduceMotion}
                aria-label="Menü deneyim demosu"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            className="relative mx-auto"
            style={{ width: '108%', marginLeft: '-4%' }}
          >
            <div className="h-3 bg-fg/15 rounded-b-2xl" />
            <div
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-fg/25 rounded-b-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
