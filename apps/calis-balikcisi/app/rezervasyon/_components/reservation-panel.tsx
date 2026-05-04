'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ZONE_LABEL } from '../_data/tables';
import type { ReservationDraft, SelectedTable } from '../_types/reservation';
import styles from '../_styles/reservation.module.css';

const TIME_SLOTS: ReadonlyArray<string> = [
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
];

const WD = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MO = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

type Day = { key: string; wd: string; dn: number; mo: string };

function buildDays(): Day[] {
  const out: Day[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      key: d.toISOString().slice(0, 10),
      wd: WD[d.getDay()] ?? '',
      dn: d.getDate(),
      mo: MO[d.getMonth()] ?? '',
    });
  }
  return out;
}

type Props = {
  open: boolean;
  table: SelectedTable | null;
  time: string;
  onTimeChange: (time: string) => void;
  onClose: () => void;
  onConfirm: (draft: ReservationDraft) => void;
};

export function ReservationPanel({
  open,
  table,
  time,
  onTimeChange,
  onClose,
  onConfirm,
}: Props) {
  const days = useMemo(buildDays, []);
  const [people, setPeople] = useState(2);
  const [date, setDate] = useState<string>(
    () => days[1]?.key ?? days[0]?.key ?? '',
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const sheetRef = useRef<HTMLElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const can = !!(date && time && people && name.trim() && phone.trim() && table);
  const dayObj = days.find((d) => d.key === date);

  function handleSubmit() {
    if (!can || !table) return;
    onConfirm({
      tableId: table.id,
      date,
      time,
      partySize: people,
      guestName: name.trim(),
      guestPhone: phone.trim(),
    });
  }

  // Mobile: swipe-down to close
  function onTouchStart(e: React.TouchEvent) {
    if (window.innerWidth > 720) return;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    if (endY - touchStartY.current > 80) onClose();
    touchStartY.current = null;
  }

  return (
    <>
      <div
        className={`${styles.scrim} ${open ? styles.open : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={sheetRef}
        className={`${styles.panel} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Rezervasyon formu"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.grabber} />
        <div className={styles.panelBody}>
          <div className={styles.panelHead}>
            <div>
              <span className={styles.label}>Rezervasyon</span>
              <h3>{table ? table.label : 'Masa seçin'}</h3>
              <p className={styles.metaLine}>
                {table ? ZONE_LABEL[table.zone] : ''}
              </p>
            </div>
            <button
              className={styles.x}
              onClick={onClose}
              aria-label="Kapat"
              type="button"
            >
              ✕
            </button>
          </div>

          <hr className={styles.thinRule} />

          <div className={styles.fieldGroup}>
            <span className={styles.label}>Kaç kişi</span>
            <div className={styles.chipRow}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.chip} ${people === n ? styles.active : ''}`}
                  onClick={() => setPeople(n)}
                  aria-pressed={people === n}
                >
                  {n} kişi
                </button>
              ))}
            </div>
            <p className={styles.fineprint}>
              Her masa 4 kişiliktir. Daha kalabalık iseniz lütfen telefonla
              arayın.
            </p>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.label}>Hangi gün</span>
            <div className={styles.chipRow}>
              {days.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  className={`${styles.chip} ${date === d.key ? styles.active : ''}`}
                  onClick={() => setDate(d.key)}
                  aria-pressed={date === d.key}
                >
                  <span className={styles.chipDayWd}>{d.wd}</span>
                  <span className={styles.chipDayDn}>
                    {d.dn} {d.mo}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.label}>Saat</span>
            <div className={styles.chipRow}>
              {TIME_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.chip} ${time === s ? styles.active : ''}`}
                  onClick={() => onTimeChange(s)}
                  aria-pressed={time === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <hr className={styles.thinRule} />

          <div className={styles.fieldGroup}>
            <input
              className={styles.input}
              placeholder="İsim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-label="İsim"
            />
          </div>
          <div className={styles.fieldGroup}>
            <input
              className={styles.input}
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              aria-label="Telefon"
            />
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.key}>
              {table?.label ?? 'Masa seçin'} · {people} kişi
            </span>
            <span className={styles.val}>
              {dayObj ? `${dayObj.dn} ${dayObj.mo}` : ''} · {time}
            </span>
          </div>

          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!can}
            onClick={handleSubmit}
          >
            Rezervasyonu onayla
          </button>

          <p className={styles.fineprint}>
            Onayı SMS ile alacaksınız. Ayrılış vaktimiz yoktur — masanız
            sizindir.
          </p>
        </div>
      </aside>
    </>
  );
}
