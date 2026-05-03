'use client';

import { useEffect, useRef, useState } from 'react';

type ManifestoRevealProps = {
  lines: string[];
  eyebrow?: string;
};

export function ManifestoReveal({ lines, eyebrow }: ManifestoRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  let wordCounter = 0;

  return (
    <div
      ref={ref}
      className="max-w-3xl mx-auto px-6 py-32 md:py-48 text-center"
    >
      {eyebrow ? (
        <div
          className="mb-8 text-xs uppercase tracking-[0.3em] text-accent transition-opacity duration-[600ms] ease-out"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {eyebrow}
        </div>
      ) : null}
      <p
        className="font-display italic text-fg"
        style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          lineHeight: 1.4,
        }}
      >
        {lines.map((line, lineIdx) => {
          const words = line.split(' ');
          return (
            <span key={lineIdx} className="block">
              {words.map((word, w) => {
                const i = wordCounter++;
                const delay = reducedMotion ? 0 : i * 80;
                return (
                  <span key={`${lineIdx}-${w}`} className="inline">
                    <span
                      className="inline-block transition-all duration-[600ms] ease-out will-change-transform"
                      style={{
                        transitionDelay: `${delay}ms`,
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(8px)',
                        filter: visible ? 'blur(0px)' : 'blur(4px)',
                      }}
                    >
                      {word}
                    </span>
                    {w < words.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </span>
          );
        })}
      </p>
    </div>
  );
}
