export function ContactHero() {
  return (
    <section className="relative w-full h-[60vh] min-h-[420px] bg-fg/5 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-bg/40"
      />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <p className="text-xs uppercase tracking-[0.4em] text-accent font-light">
          Get in touch
        </p>
        <h1 className="mt-4 md:mt-6 font-display font-bold tracking-[-0.01em] text-6xl md:text-7xl leading-tight text-fg">
          Contact
        </h1>
        <span
          aria-hidden="true"
          className="block w-16 h-px bg-accent mx-auto mt-6"
        />
      </div>
    </section>
  );
}
