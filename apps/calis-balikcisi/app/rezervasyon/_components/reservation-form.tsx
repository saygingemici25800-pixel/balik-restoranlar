'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { TablePicker } from './table-picker';
import { GUEST_OPTIONS, TIME_SLOTS } from '../_data';

type FormData = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  tableId: string | null;
  specialRequests: string;
};

const INITIAL: FormData = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: '2',
  tableId: null,
  specialRequests: '',
};

const INPUT_CLASS =
  'w-full bg-transparent border-0 border-b border-fg/30 focus:border-accent focus:outline-none py-2 text-fg placeholder:text-fg/40';

const LABEL_CLASS =
  'block text-[11px] md:text-xs uppercase tracking-wider text-fg/70 mb-1.5 md:mb-2';

export function ReservationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const isValid = Boolean(
    formData.name &&
      formData.phone &&
      formData.date &&
      formData.time &&
      formData.guests &&
      formData.tableId,
  );

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;
    sessionStorage.setItem('reservationData', JSON.stringify(formData));
    router.push('/rezervasyon/onay');
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-xs uppercase tracking-[0.4em] text-accent">
        Reservations
      </p>
      <h1 className="mt-4 md:mt-6 font-display italic text-4xl md:text-5xl lg:text-6xl leading-tight text-fg">
        Reserve your evening by the sea
      </h1>
      <div className="w-16 h-px bg-accent mt-4 md:mt-6 mb-8 md:mb-12" aria-hidden="true" />

      <div className="mb-6 md:mb-8">
        <label htmlFor="res-name" className={LABEL_CLASS}>Name</label>
        <input
          id="res-name"
          type="text"
          required
          autoComplete="name"
          value={formData.name}
          onChange={(e) => set('name', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="mb-6 md:mb-8">
        <label htmlFor="res-phone" className={LABEL_CLASS}>Phone</label>
        <input
          id="res-phone"
          type="tel"
          required
          pattern="[0-9+ ]*"
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => set('phone', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="mb-6 md:mb-8 grid grid-cols-2 gap-4 md:gap-6">
        <div>
          <label htmlFor="res-date" className={LABEL_CLASS}>Date</label>
          <input
            id="res-date"
            type="date"
            required
            min={todayISO}
            value={formData.date}
            onChange={(e) => set('date', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="res-time" className={LABEL_CLASS}>Time</label>
          <select
            id="res-time"
            required
            value={formData.time}
            onChange={(e) => set('time', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="" disabled>—</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 md:mb-8">
        <label htmlFor="res-guests" className={LABEL_CLASS}>Number of Guests</label>
        <select
          id="res-guests"
          required
          value={formData.guests}
          onChange={(e) => set('guests', e.target.value)}
          className={INPUT_CLASS}
        >
          {GUEST_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} {n === '1' ? 'Guest' : 'Guests'}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 md:mb-8">
        <p className="block text-xs md:text-sm uppercase tracking-wider text-fg/70 mb-1">Table Selection</p>
        <p className="text-xs text-fg/60 mb-4">Choose your preferred table</p>
        <TablePicker
          selectedId={formData.tableId}
          onSelect={(id) => set('tableId', id)}
        />
      </div>

      <div className="mb-8 md:mb-10">
        <label htmlFor="res-notes" className={LABEL_CLASS}>
          Special Requests{' '}
          <span className="text-fg/40 normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="res-notes"
          rows={3}
          value={formData.specialRequests}
          onChange={(e) => set('specialRequests', e.target.value)}
          className="w-full bg-transparent border-0 border-b border-fg/30 focus:border-accent focus:outline-none py-3 text-fg placeholder:text-fg/40 resize-none min-h-[80px]"
        />
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full border border-accent text-accent py-3 md:py-4 px-6 text-xs uppercase tracking-wider md:tracking-[0.3em] transition-colors hover:bg-accent hover:text-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent"
      >
        Confirm Reservation
      </button>
    </form>
  );
}
