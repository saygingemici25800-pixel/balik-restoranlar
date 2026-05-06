import Image from 'next/image';
import Link from 'next/link';
import { SiteTopBar } from './top-bar';

export function CalisHero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden text-fg">
      <div className="absolute inset-0">
        <Image
          src="/images/calis-hero-sunset.png"
          alt="Çalış Balıkçısı sahil gün batımı"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/55 to-bg/80"
        aria-hidden="true"
      />

      <SiteTopBar className="absolute top-0 left-0 right-0 z-20" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <p
          className="text-xs uppercase tracking-[0.4em] text-accent mb-8 font-light"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          Çalış Plajı, Fethiye
        </p>
        <h1
          className="font-display font-bold tracking-[-0.01em] text-fg leading-[1.05]"
          style={{
            fontSize: 'clamp(3.5rem, 8vw, 6rem)',
            textShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <span className="block">Tezgâhtan</span>
          <span className="block text-accent">Sofraya</span>
        </h1>
        <div
          className="mt-8 space-y-1 text-fg/85 leading-relaxed text-base md:text-lg"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          <p>Her sabah denizden, her akşam sofranıza.</p>
          <p>Akif Usta&apos;nın elinden, 1987&apos;den beri.</p>
        </div>
        <Link
          href="/menu"
          className="relative inline-block pb-1 mt-10"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-accent">
            Sofraya Göz At
          </span>
          <span
            aria-hidden="true"
            className="absolute left-0 bottom-0 h-px w-full bg-accent"
          />
        </Link>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-fg/60"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
