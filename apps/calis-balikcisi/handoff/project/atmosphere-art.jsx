// atmosphere-art.jsx — Karakalem illustrations for the three atmosphere cards.
// Each is a full-card SVG that fills its parent. Strokes intentionally a bit
// shaky/dashy to feel hand-drawn. No fills except very pale washes.

const SUNSET_ART = (
  <svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice" fill="none">
    <defs>
      <linearGradient id="sunset-wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f5b889" stopOpacity=".55" />
        <stop offset="55%" stopColor="#d97a3c" stopOpacity=".22" />
        <stop offset="100%" stopColor="#f3ead8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="sea-wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a6f7a" stopOpacity=".22" />
        <stop offset="100%" stopColor="#4a6f7a" stopOpacity=".06" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="360" height="270" fill="url(#sunset-wash)" />
    <rect x="0" y="240" width="360" height="160" fill="url(#sea-wash)" />
    {/* Sun */}
    <circle cx="245" cy="180" r="48" stroke="#1f1a12" strokeWidth="1.2" strokeDasharray="2 3" opacity=".75" />
    <circle cx="245" cy="180" r="48" fill="#d97a3c" fillOpacity=".18" />
    {/* Sun reflection lines */}
    <path d="M210 270 q35 12 70 0" stroke="#1f1a12" strokeWidth=".6" opacity=".4" />
    <path d="M205 290 q40 10 80 0" stroke="#1f1a12" strokeWidth=".6" opacity=".35" />
    <path d="M200 312 q45 8 90 0" stroke="#1f1a12" strokeWidth=".6" opacity=".3" />
    <path d="M195 336 q50 6 100 0" stroke="#1f1a12" strokeWidth=".6" opacity=".25" />
    {/* Horizon */}
    <line x1="0" y1="248" x2="360" y2="248" stroke="#1f1a12" strokeWidth=".7" opacity=".55" />
    {/* Distant boats */}
    <path d="M60 232 l8 0 l-2 6 l-4 0 z M64 224 l0 8" stroke="#1f1a12" strokeWidth=".7" opacity=".55" fill="none" />
    <path d="M120 238 l6 0 l-1.5 4 l-3 0 z M123 232 l0 6" stroke="#1f1a12" strokeWidth=".5" opacity=".45" fill="none" />
    {/* Foreground sand & grass strokes */}
    <path d="M0 410 q60 -18 140 -10 q90 8 220 -6 l0 86 l-360 0 z" fill="#ead9b8" fillOpacity=".55" stroke="none" />
    <g stroke="#1f1a12" strokeWidth=".55" opacity=".4" fill="none">
      <path d="M30 422 q3 -10 6 -2 q1 3 -2 6" />
      <path d="M50 418 q2 -8 5 -2" />
      <path d="M85 412 q2 -9 5 -1" />
      <path d="M130 408 q3 -10 6 -2" />
      <path d="M180 410 q2 -8 5 -2" />
      <path d="M230 405 q3 -10 6 -2" />
      <path d="M280 408 q2 -9 5 -1" />
      <path d="M325 410 q2 -8 5 -2" />
    </g>
    {/* a small umbrella */}
    <g stroke="#1f1a12" strokeWidth=".7" opacity=".55" fill="none" transform="translate(70 380)">
      <path d="M-12 0 q12 -20 24 0 z" />
      <line x1="12" y1="0" x2="12" y2="22" />
    </g>
  </svg>
);

const DINNER_ART = (
  <svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice" fill="none">
    <defs>
      <linearGradient id="dusk-wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b8997b" stopOpacity=".35" />
        <stop offset="55%" stopColor="#6b4470" stopOpacity=".18" />
        <stop offset="100%" stopColor="#2c4a55" stopOpacity=".25" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="360" height="480" fill="url(#dusk-wash)" />
    {/* Distant horizon */}
    <line x1="0" y1="200" x2="360" y2="200" stroke="#1f1a12" strokeWidth=".6" opacity=".4" />
    {/* String lights */}
    <path d="M-10 90 Q90 130 180 100 T380 110" stroke="#1f1a12" strokeWidth=".7" opacity=".55" fill="none" />
    <g fill="#d97a3c" fillOpacity=".7">
      <circle cx="20" cy="106" r="2.5" />
      <circle cx="60" cy="118" r="2.5" />
      <circle cx="100" cy="120" r="2.5" />
      <circle cx="140" cy="112" r="2.5" />
      <circle cx="180" cy="100" r="2.5" />
      <circle cx="220" cy="100" r="2.5" />
      <circle cx="260" cy="105" r="2.5" />
      <circle cx="300" cy="108" r="2.5" />
      <circle cx="340" cy="110" r="2.5" />
    </g>
    {/* Table top from above with plates */}
    <g transform="translate(180 340)" stroke="#1f1a12" strokeWidth="1" opacity=".75" fill="none">
      <ellipse cx="0" cy="0" rx="120" ry="58" />
      <ellipse cx="0" cy="0" rx="120" ry="58" stroke="#1f1a12" strokeDasharray="1 4" opacity=".4" />
      {/* plates */}
      <circle cx="-65" cy="-15" r="22" />
      <circle cx="-65" cy="-15" r="14" opacity=".4" />
      <circle cx="65" cy="-15" r="22" />
      <circle cx="65" cy="-15" r="14" opacity=".4" />
      <circle cx="-30" cy="20" r="18" />
      <circle cx="30" cy="20" r="18" />
      {/* glasses */}
      <ellipse cx="-90" cy="-30" rx="6" ry="3" />
      <ellipse cx="90" cy="-30" rx="6" ry="3" />
      {/* candle */}
      <rect x="-3" y="-8" width="6" height="14" />
      <path d="M0 -10 q-2 -4 0 -8 q2 4 0 8" fill="#d97a3c" fillOpacity=".7" stroke="#1f1a12" strokeWidth=".5" />
    </g>
    {/* steam wisps */}
    <g stroke="#1f1a12" strokeWidth=".5" opacity=".35" fill="none">
      <path d="M150 300 q-6 -12 0 -22 q6 -10 0 -20" />
      <path d="M210 300 q-6 -12 0 -22 q6 -10 0 -20" />
    </g>
  </svg>
);

const LATE_ART = (
  <svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice" fill="none">
    <defs>
      <linearGradient id="late-wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2c4a55" stopOpacity=".5" />
        <stop offset="100%" stopColor="#1f1a12" stopOpacity=".25" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="360" height="480" fill="url(#late-wash)" />
    {/* Moon */}
    <circle cx="270" cy="120" r="34" stroke="#1f1a12" strokeWidth="1" opacity=".7" fill="#f3ead8" fillOpacity=".4" />
    <circle cx="262" cy="115" r="3" fill="#1f1a12" opacity=".25" />
    <circle cx="280" cy="130" r="2" fill="#1f1a12" opacity=".2" />
    {/* Stars */}
    <g fill="#1f1a12" opacity=".55">
      <circle cx="60" cy="80" r="1" />
      <circle cx="110" cy="50" r=".8" />
      <circle cx="160" cy="90" r="1" />
      <circle cx="320" cy="60" r=".8" />
      <circle cx="40" cy="130" r=".8" />
      <circle cx="200" cy="40" r="1" />
    </g>
    {/* Sea horizon */}
    <line x1="0" y1="280" x2="360" y2="280" stroke="#1f1a12" strokeWidth=".6" opacity=".5" />
    {/* Moon reflection on sea */}
    <g stroke="#1f1a12" strokeWidth=".5" opacity=".4" fill="none">
      <path d="M255 290 q15 8 30 0" />
      <path d="M250 308 q20 6 40 0" />
      <path d="M245 326 q25 5 50 0" />
      <path d="M240 344 q30 4 60 0" />
    </g>
    {/* Lone glass with wine */}
    <g transform="translate(80 400)" stroke="#1f1a12" strokeWidth="1" fill="none" opacity=".75">
      <path d="M-12 -40 q0 18 12 22 q12 -4 12 -22 z" fill="#d97a3c" fillOpacity=".25" />
      <line x1="0" y1="-18" x2="0" y2="10" />
      <line x1="-10" y1="10" x2="10" y2="10" />
    </g>
    {/* small chair sketch */}
    <g transform="translate(280 420)" stroke="#1f1a12" strokeWidth="1" opacity=".55" fill="none">
      <rect x="-14" y="-18" width="28" height="6" />
      <rect x="-14" y="-12" width="28" height="3" />
      <line x1="-12" y1="-9" x2="-12" y2="14" />
      <line x1="12" y1="-9" x2="12" y2="14" />
    </g>
  </svg>
);

const ATMOSPHERES = [
  {
    id: 'sunset',
    when: '17:00 — 19:00',
    title: 'Gün batımı',
    blurb: '"Güneş suya değdiğinde bir kadeh, bir tabak meze."',
    avail: { dot: 'free', text: '23 masa müsait' },
    art: SUNSET_ART,
    intro: 'Işık yumuşar. Servis henüz başlamamış. Sahil kenarı masalar tek tek dolar.',
  },
  {
    id: 'dinner',
    when: '19:00 — 21:30',
    title: 'Akşam yemeği',
    blurb: '"Mevsim ne sunuyorsa o sofrada. Acele yok."',
    avail: { dot: 'few', text: '7 masa kaldı' },
    art: DINNER_ART,
    intro: 'Sofranın ana saatleri. Mutfak tam tempo, ışıklar alçalmış, masalar dolu.',
  },
  {
    id: 'late',
    when: '21:30 sonrası',
    title: 'Geç akşam',
    blurb: '"Bir kadeh rakı, dalga sesi, daha az kelime."',
    avail: { dot: 'free', text: 'Bol yer' },
    art: LATE_ART,
    intro: 'Servis yavaşlar, salon sakinleşir. Geç gelen, uzun oturan içindir.',
  },
];

window.AtmosphereArt = { ATMOSPHERES };
