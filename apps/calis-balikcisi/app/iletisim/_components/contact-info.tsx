import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../_data';

type InfoBlockProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

function InfoBlock({ icon, label, children }: InfoBlockProps) {
  return (
    <div className="flex items-start gap-4">
      <span className="shrink-0 mt-1 text-accent" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-fg/60 mb-1">
          {label}
        </p>
        <div className="text-base text-fg leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function ContactInfo() {
  const { phone, phoneHref, email, emailHref, address, openingHours, mapEmbedSrc } =
    CONTACT_INFO;

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
      <div className="grid md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
            Reach Out
          </p>
          <h2 className="font-display italic text-3xl md:text-4xl text-fg mb-12">
            Reach Out
          </h2>

          <div className="space-y-8">
            <InfoBlock icon={<Phone className="h-4 w-4" />} label="Telephone">
              <a
                href={phoneHref}
                className="hover:text-accent transition-colors"
              >
                {phone}
              </a>
            </InfoBlock>

            <InfoBlock icon={<Mail className="h-4 w-4" />} label="Email">
              <a
                href={emailHref}
                className="hover:text-accent transition-colors"
              >
                {email}
              </a>
            </InfoBlock>

            <InfoBlock icon={<MapPin className="h-4 w-4" />} label="Address">
              <a
                href={address.mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <span className="block">{address.line1}</span>
                <span className="block">{address.line2}</span>
              </a>
            </InfoBlock>

            <InfoBlock icon={<Clock className="h-4 w-4" />} label="Opening Hours">
              <ul className="space-y-1">
                {openingHours.map((slot) => (
                  <li key={slot.days} className="text-sm">
                    <span className="text-fg/70">{slot.days}: </span>
                    <span>{slot.hours}</span>
                  </li>
                ))}
              </ul>
            </InfoBlock>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
            Find Us
          </p>
          <h2 className="font-display italic text-3xl md:text-4xl text-fg mb-12">
            Find Us
          </h2>

          <div className="aspect-[4/5] w-full overflow-hidden bg-fg/5">
            <iframe
              src={mapEmbedSrc}
              title="Çalış Balıkçısı — Find Us"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0 grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition"
            />
          </div>
          <p className="mt-4 text-sm italic text-fg/60 text-center">
            By the sea, awaiting your arrival.
          </p>
        </div>
      </div>
    </section>
  );
}
