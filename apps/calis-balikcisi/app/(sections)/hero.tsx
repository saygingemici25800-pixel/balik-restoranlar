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
          className="inline-block bg-[rgba(243,234,216,0.92)] text-[#1f1a12] px-8 py-3.5 tracking-[0.18em] uppercase text-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-[#1f1a12] hover:text-[#f3ead8] transition-colors duration-300 border border-[rgba(31,26,18,0.15)] mt-10"
          style={{ textShadow: 'none' }}
        >
          Sofraya Göz At
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
