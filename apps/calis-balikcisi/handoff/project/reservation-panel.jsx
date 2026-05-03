// reservation-panel.jsx — Yan panel (desktop) / Bottom sheet (mobile)

function ReservationPanel({ open, atmos, table, onClose }) {
  const [people, setPeople] = React.useState(2);
  const [time, setTime] = React.useState(null);
  const [date, setDate] = React.useState(null);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  React.useEffect(() => {
    // Default time slot suggestion from atmosphere
    if (atmos === 'sunset') setTime('18:30');
    else if (atmos === 'dinner') setTime('20:00');
    else if (atmos === 'late') setTime('22:00');
  }, [atmos]);

  // 7 days from today
  const days = React.useMemo(() => {
    const arr = [];
    const today = new Date();
    const fmt = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push({
        key: d.toISOString().slice(0,10),
        wd: fmt[d.getDay()],
        dn: d.getDate(),
        mo: months[d.getMonth()],
      });
    }
    return arr;
  }, []);
  React.useEffect(() => { if (!date && days.length) setDate(days[1].key); }, [days, date]);

  const slots = atmos === 'sunset' ? ['17:30','18:00','18:30','19:00']
              : atmos === 'dinner' ? ['19:30','20:00','20:30','21:00','21:30']
              : ['21:30','22:00','22:30','23:00'];

  const can = !!(date && time && people && name.trim() && phone.trim() && table);

  const atmosLabel = atmos === 'sunset' ? 'Gün batımı' : atmos === 'dinner' ? 'Akşam yemeği' : 'Geç akşam';

  return (
    <>
      <div className={`scrim ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`panel ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="grabber" />
        <div className="panel-body">
          <div className="panel-head">
            <div>
              <span className="label">Rezervasyon</span>
              <h3>{table ? table.label : 'Masa seçin'}</h3>
              <p className="meta-line">{atmosLabel} · {table?.zone === 'sea' ? 'deniz kenarı' : table?.zone === 'garden' ? 'bahçe' : table?.zone === 'upper' ? 'üst kat' : 'iç salon'}</p>
            </div>
            <button className="x" onClick={onClose} aria-label="Kapat">✕</button>
          </div>

          <hr className="thin-rule" />

          <div className="field-group">
            <span className="label">Kaç kişi</span>
            <div className="chip-row">
              {[1,2,3,4].map((n) => (
                <button key={n} className={`chip ${people === n ? 'active' : ''}`} onClick={() => setPeople(n)}>
                  {n} kişi
                </button>
              ))}
            </div>
            <p className="fineprint">Her masa 4 kişiliktir. Daha kalabalık iseniz lütfen telefonla arayın.</p>
          </div>

          <div className="field-group">
            <span className="label">Hangi gün</span>
            <div className="chip-row">
              {days.map((d) => (
                <button key={d.key} className={`chip ${date === d.key ? 'active' : ''}`} onClick={() => setDate(d.key)}>
                  <span style={{ display: 'block', fontSize: '.7rem', opacity: .7, marginBottom: 2 }}>{d.wd}</span>
                  <span style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: '1rem' }}>{d.dn} {d.mo}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <span className="label">Saat</span>
            <div className="chip-row">
              {slots.map((s) => (
                <button key={s} className={`chip ${time === s ? 'active' : ''}`} onClick={() => setTime(s)}>{s}</button>
              ))}
            </div>
          </div>

          <hr className="thin-rule" />

          <div className="field-group">
            <input className="input" placeholder="İsim" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field-group">
            <input className="input" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
          </div>

          <div className="summary-row">
            <span className="key">{table?.label} · {people} kişi</span>
            <span className="val">{date ? days.find(d => d.key === date)?.dn + ' ' + days.find(d => d.key === date)?.mo : ''} · {time}</span>
          </div>

          <button className="btn-primary" disabled={!can}>
            Rezervasyonu onayla
          </button>

          <p className="fineprint">Onayı SMS ile alacaksınız. Ayrılış vaktimiz yoktur — masanız sizindir.</p>
        </div>
      </aside>
    </>
  );
}

window.ReservationPanel = ReservationPanel;
