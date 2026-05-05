'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './menu-demo-video.module.css';

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
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, [reduceMotion]);

  return (
    <section className="py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16 px-6 md:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-accent">
          Deneyim
        </p>
        <p className="font-display italic text-2xl text-fg/80 mt-3">
          Tabaklara dokunarak keşfedin
        </p>
      </div>

      <div className={styles.videoSection}>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          aria-hidden="true"
          className={styles.menuVideo}
        >
          <source src="/menu-loop.mov" type="video/quicktime" />
          <source src="/menu-loop.mov" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
