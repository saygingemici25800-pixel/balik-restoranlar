import Link from 'next/link';

export function ReserveCta() {
  return (
    <section className="relative py-32 md:py-40 px-6 overflow-hidden">
      <div className="relative max-w-2xl mx-auto text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-accent"
          aria-hidden="true"
        >
          <path d="M8 3h8l-1 9a3 3 0 0 1-3 3 3 3 0 0 1-3-3L8 3Z" />
          <path d="M12 15v6" />
          <path d="M9 21h6" />
        </svg>
        <h2 className="mt-8 font-display text-4xl md:text-6xl leading-tight text-fg">
          Sahil Akşamınızı Ayırt
        </h2>
        <p className="mt-8 text-fg/70 leading-relaxed max-w-md mx-auto">
          Yer sınırlı. Çalış Balıkçısı deneyimini tam yaşamak için masanızı önceden ayırtmanızı öneririz.
        </p>
        <Link
          href="/rezervasyon"
          className="inline-block mt-10 border border-fg/80 text-fg hover:bg-fg hover:text-bg transition-colors px-10 py-4 text-xs uppercase tracking-[0.3em]"
        >
          Masa Ayırt
        </Link>
      </div>
    </section>
  );
}
