import Link from 'next/link';

type Props = {
  className?: string;
};

export function SiteTopBar({ className = '' }: Props) {
  return (
    <header
      className={`px-6 md:px-16 py-6 grid grid-cols-3 items-center ${className}`}
    >
      <button
        type="button"
        aria-label="Menüyü aç"
        className="justify-self-start -ml-2 p-2 text-fg hover:text-accent transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
          aria-hidden="true"
        >
          <line x1="3" y1="8" x2="21" y2="8" />
          <line x1="3" y1="16" x2="21" y2="16" />
        </svg>
      </button>

      <Link
        href="/"
        className="font-display text-xl uppercase text-fg tracking-[0.25em] justify-self-center"
      >
        Çalış Balıkçısı
      </Link>

      <Link
        href="/rezervasyon"
        className="relative inline-block justify-self-end pb-1"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-accent">
          Reservation
        </span>
        <span
          aria-hidden="true"
          className="absolute left-0 bottom-0 h-px w-full bg-accent"
        />
      </Link>
    </header>
  );
}
