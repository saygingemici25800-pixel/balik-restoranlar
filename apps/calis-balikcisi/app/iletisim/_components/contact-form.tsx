'use client';

import { useState, type FormEvent } from 'react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const INITIAL: FormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

const INPUT_CLASS =
  'w-full bg-transparent border-0 border-b border-fg/30 focus:border-accent focus:outline-none py-2 text-fg placeholder:text-fg/40';

const LABEL_CLASS =
  'block text-[11px] md:text-xs uppercase tracking-wider text-fg/70 mb-1.5 md:mb-2 font-light';

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL);

  const isValid = Boolean(
    formData.name && formData.email && formData.message,
  );

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;
    console.log('Inquiry submitted', formData);
    alert('Mesajınız iletildi — yakında size dönüş yapılacak.');
  }

  return (
    <section className="border-t border-fg/10 py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-accent text-center mb-6 font-light">
          Mesajınız
        </p>
        <h2 className="font-display font-bold tracking-[-0.01em] text-3xl md:text-4xl text-fg text-center mb-12">
          Mesajınız
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 md:mb-8">
            <label htmlFor="contact-name" className={LABEL_CLASS}>
              İsim
            </label>
            <input
              id="contact-name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={(e) => set('name', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="mb-6 md:mb-8">
            <label htmlFor="contact-email" className={LABEL_CLASS}>
              E-posta
            </label>
            <input
              id="contact-email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => set('email', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="mb-6 md:mb-8">
            <label htmlFor="contact-phone" className={LABEL_CLASS}>
              Telefon{' '}
              <span className="text-fg/40 normal-case tracking-normal">
                (isteğe bağlı)
              </span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              pattern="[0-9+ ]*"
              value={formData.phone}
              onChange={(e) => set('phone', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="mb-8 md:mb-10">
            <label htmlFor="contact-message" className={LABEL_CLASS}>
              Mesaj
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => set('message', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-fg/30 focus:border-accent focus:outline-none py-3 text-fg placeholder:text-fg/40 resize-none min-h-[120px]"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full border border-accent text-accent py-3 md:py-4 px-6 text-xs md:text-sm uppercase tracking-wider md:tracking-[0.3em] font-bold transition-colors hover:bg-accent hover:text-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent"
          >
            Gönder
          </button>
        </form>
      </div>
    </section>
  );
}
