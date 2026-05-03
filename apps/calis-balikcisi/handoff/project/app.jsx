// app.jsx — Çalış Balıkçısı rezervasyon ana akışı

const { ATMOSPHERES } = window.AtmosphereArt;
const { IsoMap, ReservationPanel } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "view": "atmosphere",
  "atmosphere": "sunset",
  "region": "sea",
  "floor": "main",
  "showRecommended": true,
  "showAmbient": true
}/*EDITMODE-END*/;

const REGIONS = [
  { id: 'sea', label: 'Deniz kenarı', count: 30 },
  { id: 'garden', label: 'Bahçe', count: 20 },
  { id: 'indoor', label: 'İç salon', count: 20 },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [selectedTable, setSelectedTable] = React.useState(null);
  const [panelOpen, setPanelOpen] = React.useState(false);

  const atmos = ATMOSPHERES.find((a) => a.id === t.atmosphere) || ATMOSPHERES[0];

  const onTableSelect = (id) => {
    // build the label/zone from the same generators used in iso-map
    const label = id.startsWith('T') ? `Masa ${id.slice(1)}`
                : id.startsWith('G') ? `Bahçe ${id.slice(1)}`
                : id.startsWith('U') ? `Üst ${id.slice(1)}`
                : `İç ${id.slice(1)}`;
    const zone = id.startsWith('T') ? 'sea'
              : id.startsWith('G') ? 'garden'
              : id.startsWith('U') ? 'upper'
              : 'indoor';
    setSelectedTable({ id, label, zone });
    setPanelOpen(true);
  };

  const goAtmosphere = () => setTweak('view', 'atmosphere');
  const pickAtmosphere = (id) => {
    setTweak({ atmosphere: id, view: 'map' });
  };

  return (
    <>
      <header className="topbar">
        <div className="brand">
          Çalış Balıkçısı
          <small>Fethiye · Çalış sahili</small>
        </div>
        <nav>
          <a href="#">Mekân</a>
          <a href="#">Mutfak</a>
          <a href="#" className="active">Rezervasyon</a>
          <a href="#">Manifesto</a>
        </nav>
      </header>

      {t.view === 'atmosphere' && <AtmosphereView selected={t.atmosphere} onPick={pickAtmosphere} />}
      {t.view === 'map' && (
        <MapView
          atmos={atmos}
          region={t.region}
          floor={t.floor}
          selected={selectedTable?.id}
          onRegion={(r) => setTweak('region', r)}
          onFloor={(f) => setTweak('floor', f)}
          onSelect={onTableSelect}
          onBack={goAtmosphere}
        />
      )}

      <ReservationPanel
        open={panelOpen}
        atmos={atmos.id}
        table={selectedTable}
        onClose={() => setPanelOpen(false)}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Görünüm" />
        <TweakRadio label="Ekran" value={t.view} options={[
          { value: 'atmosphere', label: 'Atmosfer' },
          { value: 'map', label: 'Harita' },
        ]} onChange={(v) => setTweak('view', v)} />

        <TweakSection label="Atmosfer" />
        <TweakRadio label="Saat dilimi" value={t.atmosphere} options={[
          { value: 'sunset', label: 'Gün batımı' },
          { value: 'dinner', label: 'Akşam' },
          { value: 'late', label: 'Geç' },
        ]} onChange={(v) => setTweak('atmosphere', v)} />

        <TweakSection label="Bölge" />
        <TweakRadio label="Bölge" value={t.region} options={[
          { value: 'sea', label: 'Deniz' },
          { value: 'garden', label: 'Bahçe' },
          { value: 'indoor', label: 'İç' },
        ]} onChange={(v) => setTweak('region', v)} />
        {t.region === 'indoor' && (
          <TweakRadio label="Kat" value={t.floor} options={[
            { value: 'main', label: 'Zemin' },
            { value: 'upper', label: 'Üst kat' },
          ]} onChange={(v) => setTweak('floor', v)} />
        )}

        <TweakSection label="Detay" />
        <TweakToggle label="Önerilen masa halkası" value={t.showRecommended} onChange={(v) => setTweak('showRecommended', v)} />
        <TweakToggle label="Ambiyans hareketi" value={t.showAmbient} onChange={(v) => setTweak('showAmbient', v)} />
      </TweaksPanel>
    </>
  );
}

function AtmosphereView({ selected, onPick }) {
  return (
    <>
      <section className="atmos-intro">
        <span className="label">Rezervasyon · 1/2</span>
        <h1>Hangi ışık altında <span className="italic serif">yemek istersin?</span></h1>
        <p>
          Üç saat dilimi, üç ayrı sofra hissi. Önce atmosfer seç —
          sonra sana o saate uygun masaları gösterelim. Acelen varsa
          <button className="alt-link" style={{ marginLeft: 6 }}>klasik formla rezervasyon yap →</button>
        </p>
      </section>
      <section className="atmos-stage">
        {ATMOSPHERES.map((a) => (
          <article key={a.id}
                   className={`atmos-card ${selected === a.id ? 'selected' : ''}`}
                   onClick={() => onPick(a.id)}>
            <div className="atmos-art">{a.art}</div>
            <div className="atmos-meta">
              <span className="when">{a.when}</span>
              <h2>{a.title}</h2>
              <p className="blurb">{a.blurb}</p>
              <div className="avail">
                <span className={`dot ${a.avail.dot}`} />
                {a.avail.text}
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function MapView({ atmos, region, floor, selected, onRegion, onFloor, onSelect, onBack }) {
  return (
    <section className="map-stage">
      <div className="map-header">
        <div className="left">
          <div className="crumb">
            <button className="back" onClick={onBack}>← atmosfer seçimi</button>
            <span>·</span>
            <span>{atmos.title}</span>
          </div>
          <h2>{atmos.title.toLowerCase()} için <span className="italic">müsait masalar</span></h2>
          <p>{atmos.intro}</p>
        </div>
        <div className="map-controls">
          <div className="region-pills" role="tablist">
            {REGIONS.map((r) => (
              <button key={r.id} className={region === r.id ? 'active' : ''}
                      onClick={() => onRegion(r.id)}>
                {r.label} <span style={{ opacity: .6, fontWeight: 400, marginLeft: 4 }}>{r.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="legend">
        <span><i className="free" /> müsait</span>
        <span><i className="taken" /> dolu</span>
        <span><i className="recommended" /> bizden öneri</span>
        {region === 'indoor' && (
          <>
            <span style={{ marginLeft: 'auto' }} />
            <span className="region-pills" style={{ padding: 2 }}>
              <button className={floor === 'main' ? 'active' : ''} onClick={() => onFloor('main')} style={{ padding: '4px 10px', fontSize: '.78rem' }}>zemin</button>
              <button className={floor === 'upper' ? 'active' : ''} onClick={() => onFloor('upper')} style={{ padding: '4px 10px', fontSize: '.78rem' }}>üst kat</button>
            </span>
          </>
        )}
      </div>

      <div className="map-frame">
        <IsoMap atmos={atmos.id} region={region} floor={floor}
                selected={selected} onSelect={onSelect} />
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
