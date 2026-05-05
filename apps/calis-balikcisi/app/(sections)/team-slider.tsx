'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@balik/ui';
import { TEAM_MEMBERS, type TeamMember } from './_team-data';

type MemberVisualProps = {
  member: TeamMember;
  sizes: string;
  priority?: boolean;
};

function MemberVisual({ member, sizes, priority = false }: MemberVisualProps) {
  if (!member.imageSrc) {
    return <div className="absolute inset-0 bg-fg/5" aria-hidden="true" />;
  }
  return (
    <Image
      src={member.imageSrc}
      alt={member.name}
      fill
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      className="object-cover"
    />
  );
}

export function TeamSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const total = TEAM_MEMBERS.length;
  const current = TEAM_MEMBERS[index];
  if (!current) return null;

  function go(delta: 1 | -1) {
    setDirection(delta);
    setIndex((i) => (i + delta + total) % total);
  }

  function jumpTo(targetId: number) {
    const targetIndex = TEAM_MEMBERS.findIndex((m) => m.id === targetId);
    if (targetIndex === -1 || targetIndex === index) return;
    setDirection(targetIndex > index ? 1 : -1);
    setIndex(targetIndex);
  }

  const thumbnails = TEAM_MEMBERS.filter((m) => m.id !== current.id).slice(
    0,
    3,
  );

  return (
    <section className="py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">
            Mutfağın Ardındakiler
          </p>
          <h2 className="mt-6 font-display text-5xl md:text-6xl leading-tight text-fg">
            Ekibimiz
          </h2>
          <div className="w-12 h-px bg-accent mx-auto mt-6" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
          <div className="md:col-span-3 flex md:flex-col items-center md:items-start gap-6 md:gap-8">
            <div className="flex items-center gap-4">
              <span className="font-display text-3xl text-fg">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-fg/50">
                / {String(total).padStart(2, '0')}
              </span>
            </div>

            <p
              className="hidden md:block text-xs uppercase tracking-[0.4em] text-fg/60"
              style={{ writingMode: 'vertical-rl' }}
            >
              Ekibimiz
            </p>

            <ul className="flex md:flex-col gap-3 md:gap-4">
              {thumbnails.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(member.id)}
                    aria-label={`${member.name}'a geç`}
                    className="relative block h-16 w-16 md:h-20 md:w-20 overflow-hidden bg-fg/5 border border-fg/10 hover:border-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <MemberVisual member={member} sizes="80px" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-[3/4] bg-fg/5 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <MemberVisual
                    member={current}
                    sizes="(min-width: 768px) 40vw, 100vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="md:col-span-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, y: direction * 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction * -20 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <p className="text-xs font-body uppercase tracking-[0.3em] text-fg/60">
                  {current.role}
                </p>
                <h3 className="mt-3 font-display text-3xl md:text-4xl text-fg">
                  {current.name}
                </h3>
                <blockquote className="mt-8 font-display text-2xl md:text-3xl leading-snug text-fg/90">
                  “{current.quote}”
                </blockquote>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Önceki"
                className={buttonVariants({
                  variant: 'secondary',
                  className: 'h-11 w-11 px-0 rounded-none',
                })}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Sonraki"
                className={buttonVariants({
                  variant: 'primary',
                  className: 'h-11 w-11 px-0 rounded-none',
                })}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
