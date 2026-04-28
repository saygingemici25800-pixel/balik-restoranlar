export function VideoHero() {
  return (
    <section className="pt-12 md:pt-16 pb-16 px-6 md:px-10">
      <div className="relative max-w-6xl mx-auto aspect-[21/9] overflow-hidden bg-fg/5">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/menu-intro.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <p className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.4em] text-accent">
          A Culinary Journey
        </p>
      </div>
    </section>
  );
}
