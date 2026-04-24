import Link from 'next/link';

type SocialLink = {
  label: string;
  href: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'Tripadvisor', href: '#' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-fg/10 py-16 md:py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 md:gap-12">
          <div>
            <p className="font-display text-lg uppercase tracking-[0.25em] text-fg">
              Çalış Balıkçısı
            </p>
            <p className="mt-6 text-fg/70 leading-relaxed max-w-xs">
              A refined seaside dining experience honoring the pure essence of the Mediterranean catch.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-6">Social</p>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs uppercase tracking-[0.3em] text-fg/80 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:text-right">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-6">Visit</p>
            <address className="not-italic space-y-3 text-fg/80">
              <p>
                Çalış Plajı, Fethiye
                <br />
                Muğla, Türkiye
              </p>
              <p>
                <a
                  href="mailto:info@calisbalikcisi.com"
                  className="hover:text-accent transition-colors"
                >
                  info@calisbalikcisi.com
                </a>
              </p>
              <p>
                <a
                  href="tel:+905551234567"
                  className="hover:text-accent transition-colors"
                >
                  +90 555 123 45 67
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-fg/10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-fg/50">
            © 2026 Çalış Balıkçısı. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
