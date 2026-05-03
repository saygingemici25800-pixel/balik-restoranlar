// iso-map.jsx — Karakalem aksonometrik mini-harita
//
// Approach: a single SVG canvas with skewed/scaled groups for each region.
// Each table is a small parallelogram. We draw exactly one region's table set
// at a time (sea / garden / indoor) with the surrounding sketch context drawn
// faintly behind it, so the focus stays on the 15-20 tables on screen.

// ─── helpers ────────────────────────────────────────────────────────────────
// Iso projection: 30° angle. We project (x, y) on ground plane to screen.
const ISO_ANGLE = 30 * Math.PI / 180;
const COS = Math.cos(ISO_ANGLE);
const SIN = Math.sin(ISO_ANGLE);
function iso(x, y, z = 0) {
  // x,y in plan; z = height. screen coords:
  return {
    sx: (x - y) * COS,
    sy: (x + y) * SIN - z,
  };
}

// ─── Table glyph ───────────────────────────────────────────────────────────
// Each table is a 4-seater drawn from above-and-left, like a small block with
// 4 seat-marks around it. Stroke style varies by status:
//   free        → solid ink
//   taken       → dashed faint
//   recommended → solid + soft sun-fill
//   selected    → solid + thicker contour
// Flat (top-down) table — used for the sea row layout where the user wants
// horizontal rows aligned to the bottom of the canvas, not the diagonal iso grid.
function FlatTable({ id, x, y, status, label, onSelect, onHover, onLeave }) {
  const w = 22, d = 14;
  const ink =
    status === 'taken' ? 'rgba(31,26,18,.32)' :
    '#1f1a12';
  const dash = status === 'taken' ? '2 2.5' : '0';
  const fill =
    status === 'recommended' ? 'rgba(217,122,60,.18)' :
    status === 'selected' ? 'rgba(217,122,60,.32)' :
    'rgba(255,255,255,.5)';
  const sw = status === 'selected' ? 1.6 : (status === 'taken' ? .7 : 1);
  return (
    <g style={{ color: ink }} onClick={status === 'taken' ? undefined : () => onSelect(id)}
       onMouseEnter={() => onHover(id, label, { sx: x, sy: y })} onMouseLeave={onLeave}
       className={`tbl ${status}`}>
      <ellipse cx={x} cy={y + d/2 + 3} rx={12} ry={2.5} fill="#1f1a12" opacity=".06" />
      {/* chairs: top, bottom, left, right */}
      <line x1={x - w/2 - 5} y1={y} x2={x - w/2 - 1} y2={y} stroke={ink} strokeWidth="1" strokeLinecap="round" />
      <line x1={x + w/2 + 1} y1={y} x2={x + w/2 + 5} y2={y} stroke={ink} strokeWidth="1" strokeLinecap="round" />
      <line x1={x} y1={y - d/2 - 4} x2={x} y2={y - d/2 - 1} stroke={ink} strokeWidth="1" strokeLinecap="round" />
      <line x1={x} y1={y + d/2 + 1} x2={x} y2={y + d/2 + 4} stroke={ink} strokeWidth="1" strokeLinecap="round" />
      <rect x={x - w/2} y={y - d/2} width={w} height={d}
            fill={fill} stroke={ink} strokeWidth={sw} strokeDasharray={dash} />
      {status !== 'taken' && (
        <line x1={x - w/2 + 3} y1={y - d/2 + 3} x2={x + w/2 - 3} y2={y - d/2 + 3}
              stroke={ink} strokeWidth=".4" opacity=".4" />
      )}
      {status === 'recommended' && (
        <circle cx={x} cy={y} r="22" stroke="#d97a3c" strokeWidth=".8" strokeDasharray="2 3" fill="none" opacity=".7" />
      )}
    </g>
  );
}

function Table({ id, x, y, status, label, onSelect, onHover, onLeave }) {
  const c = iso(x, y);
  const w = 22, d = 14; // table footprint in plan
  // four corners projected
  const A = iso(x - w/2, y - d/2);
  const B = iso(x + w/2, y - d/2);
  const C = iso(x + w/2, y + d/2);
  const D = iso(x - w/2, y + d/2);
  const corners = `M${A.sx} ${A.sy} L${B.sx} ${B.sy} L${C.sx} ${C.sy} L${D.sx} ${D.sy} Z`;

  // chairs: little marks just outside each side
  const chair = (x0, y0, dx, dy, k) => {
    const s = iso(x0 + dx*0.7, y0 + dy*0.7);
    const e = iso(x0 + dx*1.4, y0 + dy*1.4);
    return <line key={k} x1={s.sx} y1={s.sy} x2={e.sx} y2={e.sy}
                 stroke="currentColor" strokeWidth="1" strokeLinecap="round" />;
  };

  const ink =
    status === 'taken' ? 'rgba(31,26,18,.32)' :
    status === 'recommended' ? '#1f1a12' :
    status === 'selected' ? '#1f1a12' :
    '#1f1a12';
  const dash = status === 'taken' ? '2 2.5' : '0';
  const fill =
    status === 'recommended' ? 'rgba(217,122,60,.18)' :
    status === 'selected' ? 'rgba(217,122,60,.32)' :
    'rgba(255,255,255,.5)';
  const sw = status === 'selected' ? 1.6 : (status === 'taken' ? .7 : 1);

  return (
    <g style={{ color: ink }} onClick={status === 'taken' ? undefined : () => onSelect(id)}
       onMouseEnter={() => onHover(id, label, c)} onMouseLeave={onLeave}
       className={`tbl ${status}`}>
      {/* shadow */}
      <ellipse cx={c.sx} cy={c.sy + 2} rx={14} ry={4} fill="#1f1a12" opacity=".06" />
      {/* chairs */}
      {chair(x, y, -w/2 - 4, 0, 1)}
      {chair(x, y, w/2 + 4, 0, 2)}
      {chair(x, y, 0, -d/2 - 3, 3)}
      {chair(x, y, 0, d/2 + 3, 4)}
      {/* table top */}
      <path d={corners} fill={fill} stroke={ink} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
      {/* slight inner mark */}
      {status !== 'taken' && (
        <path d={`M${A.sx+3} ${A.sy+2} L${B.sx-3} ${B.sy+2}`} stroke={ink} strokeWidth=".4" opacity=".4" />
      )}
      {/* recommended ring */}
      {status === 'recommended' && (
        <circle cx={c.sx} cy={c.sy} r="22" stroke="#d97a3c" strokeWidth=".8" strokeDasharray="2 3" fill="none" opacity=".7" />
      )}
    </g>
  );
}

// ─── Region datasets ────────────────────────────────────────────────────────
// Plan coords (origin at center of the canvas). Tables are drawn as a row/grid
// matching the brief: 3 rows × 10 along the seafront; clusters in garden;
// indoor floor + upper.
function buildSeaTables() {
  const out = [];
  let id = 1;
  // 3 rows of 10, packed close along the shore (y just below shoreline)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++) {
      out.push({
        id: `T${id}`,
        label: `Masa ${id}`,
        x: -180 + col * 40,
        y: 30 + row * 32,
        zone: 'sea',
      });
      id++;
    }
  }
  return out;
}

function buildGardenTables() {
  // 20 tables in 2 looser rows under string lights
  const out = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 10; col++) {
      out.push({
        id: `G${row*10+col+1}`,
        label: `Bahçe ${row*10+col+1}`,
        x: -180 + col * 40 + (row % 2 ? 10 : 0),
        y: -30 + row * 44,
        zone: 'garden',
      });
    }
  }
  return out;
}

function buildIndoorTables(floor) {
  // 20 tables in 4 rows × 5 within "indoor" rectangle
  const out = [];
  const prefix = floor === 'upper' ? 'U' : 'I';
  const tag = floor === 'upper' ? 'Üst' : 'İç';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      out.push({
        id: `${prefix}${row*5+col+1}`,
        label: `${tag} ${row*5+col+1}`,
        x: -90 + col * 40,
        y: -50 + row * 28,
        zone: floor === 'upper' ? 'upper' : 'indoor',
      });
    }
  }
  return out;
}

// Arbitrary "taken" set per atmosphere — feels organic not random
const TAKEN_BY_ATMOS = {
  sunset: { sea: ['T2', 'T7', 'T11', 'T15', 'T22', 'T26'], garden: ['G3', 'G8', 'G14'], indoor: ['I4', 'I12'], upper: ['U2'] },
  dinner: { sea: ['T1','T2','T3','T6','T7','T8','T11','T13','T14','T17','T20','T21','T23','T26','T28'],
            garden: ['G1','G2','G5','G7','G9','G11','G12','G14','G16','G18','G20'],
            indoor: ['I1','I3','I5','I7','I9','I11','I13','I15','I17','I19'],
            upper: ['U1','U3','U6','U8','U10','U13','U15','U18'] },
  late:   { sea: ['T5','T18','T25'], garden: ['G6','G19'], indoor: ['I8'], upper: [] },
};

const RECOMMENDED_BY_ATMOS = {
  sunset: ['T4', 'T13'],   // front row, sea facing
  dinner: ['I10', 'G15'],  // mid garden, indoor center
  late:   ['T15', 'U7'],   // sea single, upper quiet
};

// ─── Region context (sketchy backdrop) ─────────────────────────────────────
function SeaBackdrop() {
  // Wave row generator — choppy, irregular peaks like hand-drawn rough sea.
  // Each segment is an angular line with random-ish peak height & spacing,
  // so the waves read as restless surface, not smooth sinus.
  const wave = (y, amp = 5, phase = 0, choppy = false) => {
    const start = -380;
    const end = 380;
    let d = `M${start} ${y}`;
    let x = start;
    let i = 0;
    while (x < end) {
      // pseudo-random step + amplitude based on phase + index
      const seed = (i * 13 + phase) % 100;
      const seed2 = (i * 7 + phase * 3) % 100;
      const step = choppy ? 14 + (seed % 18) : 26 + (seed % 14);
      const peakH = choppy ? amp + (seed2 % 8) - 2 : amp;
      const dir = i % 2 === 0 ? -1 : 1;
      const xMid = x + step / 2;
      const yPeak = y + dir * peakH * (choppy ? 1 : .8);
      // angular spike for choppy, gentle q-curve otherwise
      if (choppy) {
        d += ` L${xMid} ${yPeak} L${x + step} ${y + (seed % 3 - 1)}`;
      } else {
        d += ` Q${xMid} ${yPeak} ${x + step} ${y + (seed % 3 - 1) * .5}`;
      }
      x += step;
      i++;
    }
    return d;
  };

  return (
    <g opacity=".75">
      {/* sun */}
      <g className="ambient-sun">
        <circle cx="-310" cy="-180" r="34" stroke="#1f1a12" strokeWidth="1" strokeDasharray="2 3" fill="rgba(217,122,60,.18)" />
        <circle cx="-310" cy="-180" r="20" fill="#d97a3c" fillOpacity=".15" />
      </g>

      {/* sea — choppy hand-drawn waves filling the upper half */}
      <g className="ambient-sea" stroke="#1f1a12" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={wave(-205, 4, 3, false)} strokeWidth=".6" opacity=".5" />
        <path d={wave(-185, 5, 18, false)} strokeWidth=".6" opacity=".55" />
        <path d={wave(-165, 7, 41, true)} strokeWidth=".9" opacity=".7" />
        <path d={wave(-148, 9, 17, true)} strokeWidth="1" opacity=".8" />
        <path d={wave(-128, 11, 63, true)} strokeWidth="1.1" opacity=".85" />
        <path d={wave(-108, 8, 29, true)} strokeWidth=".9" opacity=".7" />
        <path d={wave(-88, 6, 51, true)} strokeWidth=".8" opacity=".6" />
        <path d={wave(-68, 4, 8, false)} strokeWidth=".6" opacity=".5" />
        <path d={wave(-50, 3, 14, false)} strokeWidth=".5" opacity=".4" />
      </g>

      {/* sun glitter — short broken strokes pointing back from sun */}
      <g stroke="#d97a3c" strokeWidth="1.2" fill="none" opacity=".55" strokeLinecap="round">
        <path d="M-280 -178 l14 0" />
        <path d="M-258 -158 l18 -2" />
        <path d="M-236 -136 l20 -3" />
        <path d="M-214 -114 l24 -4" />
        <path d="M-194 -92 l26 -5" />
        <path d="M-174 -72 l28 -6" />
      </g>

      {/* shoreline — sea pulled smaller, sand starts higher */}
      <path d="M-380 -112 Q-200 -122 -40 -114 T200 -108 T380 -102"
            stroke="#1f1a12" strokeWidth=".8" opacity=".55" fill="none" />
      <path d="M-380 -106 Q-200 -116 -40 -108 T200 -102 T380 -96"
            stroke="#1f1a12" strokeWidth=".4" opacity=".3" fill="none" />

      {/* SAND band */}
      <rect x="-380" y="-106" width="760" height="22" fill="#ead9b8" fillOpacity=".6" />
      <rect x="-380" y="-106" width="760" height="22" fill="#d97a3c" fillOpacity=".06" />
      <g fill="#1f1a12" opacity=".28">
        {Array.from({ length: 70 }, (_, i) => {
          const x = -370 + (i * 10.8) + ((i * 31) % 7);
          const y = -102 + ((i * 17) % 18);
          return <circle key={i} cx={x} cy={y} r=".7" />;
        })}
      </g>
      <g fill="#1f1a12" opacity=".22">
        <ellipse cx="-180" cy="-98" rx="2.5" ry="1.2" transform="rotate(20 -180 -98)" />
        <ellipse cx="-172" cy="-90" rx="2.5" ry="1.2" transform="rotate(20 -172 -90)" />
        <ellipse cx="-164" cy="-98" rx="2.5" ry="1.2" transform="rotate(20 -164 -98)" />
        <ellipse cx="80" cy="-92" rx="2.5" ry="1.2" transform="rotate(-15 80 -92)" />
        <ellipse cx="88" cy="-100" rx="2.5" ry="1.2" transform="rotate(-15 88 -100)" />
      </g>
      <text x="220" y="-90" fontFamily="Spectral, serif" fontStyle="italic" fontSize="11" fill="#1f1a12" opacity=".45">kum</text>

      {/* WALKWAY — promenade right after sand */}
      <rect x="-380" y="-84" width="760" height="18" fill="#f3ead8" />
      <line x1="-380" y1="-84" x2="380" y2="-84" stroke="#1f1a12" strokeWidth=".7" opacity=".5" />
      <line x1="-380" y1="-66" x2="380" y2="-66" stroke="#1f1a12" strokeWidth=".7" opacity=".5" />
      <g stroke="#1f1a12" strokeWidth=".5" opacity=".38">
        {Array.from({ length: 22 }, (_, i) => {
          const x = -360 + i * 35;
          return <line key={i} x1={x} y1="-84" x2={x} y2="-66" />;
        })}
      </g>
      <g stroke="#1f1a12" strokeWidth=".8" fill="none" opacity=".7" strokeLinecap="round">
        <g transform="translate(-90 -73)">
          <circle cx="0" cy="-6" r="1.4" fill="#1f1a12" />
          <line x1="0" y1="-4" x2="0" y2="3" />
          <line x1="0" y1="-2" x2="-3" y2="1" />
          <line x1="0" y1="-2" x2="3" y2="1" />
          <line x1="0" y1="3" x2="-2" y2="7" />
          <line x1="0" y1="3" x2="2" y2="7" />
        </g>
        <g transform="translate(-82 -73)">
          <circle cx="0" cy="-6" r="1.2" fill="#1f1a12" />
          <line x1="0" y1="-4" x2="0" y2="2" />
          <line x1="0" y1="-2" x2="3" y2="0" />
          <line x1="0" y1="2" x2="-2" y2="6" />
          <line x1="0" y1="2" x2="2" y2="6" />
        </g>
        <g transform="translate(160 -73)">
          <circle cx="0" cy="-6" r="1.4" fill="#1f1a12" />
          <line x1="0" y1="-4" x2="0" y2="3" />
          <line x1="0" y1="-2" x2="-3" y2="1" />
          <line x1="0" y1="-2" x2="3" y2="1" />
          <line x1="0" y1="3" x2="-2" y2="7" />
          <line x1="0" y1="3" x2="3" y2="6" />
        </g>
      </g>
      <text x="-360" y="-70" fontFamily="Spectral, serif" fontStyle="italic" fontSize="10" fill="#1f1a12" opacity=".45">— sahil yolu —</text>

      {/* FENCE — restaurant threshold just below walkway */}
      <g stroke="#1f1a12" strokeWidth=".7" fill="none" opacity=".55">
        <line x1="-340" y1="-62" x2="340" y2="-62" />
        <line x1="-340" y1="-58" x2="340" y2="-58" />
        {Array.from({ length: 18 }, (_, i) => {
          const x = -340 + i * 40;
          return <line key={i} x1={x} y1="-64" x2={x} y2="-55" />;
        })}
      </g>
      <rect x="-12" y="-65" width="24" height="11" fill="#f3ead8" />
      <text x="-22" y="-55" fontFamily="Spectral, serif" fontStyle="italic" fontSize="9" fill="#1f1a12" opacity=".55">↓ giriş</text>

      {/* INDOOR ZONE — floor + back wall, tables drawn separately as clickable */}
      <rect x="-380" y="75" width="760" height="60" fill="#ead9b8" fillOpacity=".35" />
      <line x1="-380" y1="75" x2="380" y2="75" stroke="#1f1a12" strokeWidth=".5" strokeDasharray="3 4" opacity=".5" />
      <text x="-360" y="86" fontFamily="Spectral, serif" fontStyle="italic" fontSize="10" fill="#1f1a12" opacity=".5">iç salon</text>

      {/* ÇALIŞ BALIKÇISI tabela — between indoor and kitchen */}
      <g transform="translate(0 144)">
        <rect x="-150" y="-9" width="300" height="18" fill="#f3ead8" stroke="#1f1a12" strokeWidth=".8" opacity=".9" />
        <text x="0" y="4" textAnchor="middle" fontFamily="Spectral, serif" fontSize="13" fill="#1f1a12" letterSpacing=".08em">ÇALIŞ BALIKÇISI</text>
        {/* small fish ornament */}
        <path d="M-168 0 q3 -3 7 0 q4 3 7 0 l-3 0 l3 3 l-3 0 q-4 -3 -7 0 q-4 3 -7 0 z" stroke="#1f1a12" strokeWidth=".5" fill="none" />
        <path d="M168 0 q-3 -3 -7 0 q-4 3 -7 0 l3 0 l-3 3 l3 0 q4 -3 7 0 q4 3 7 0 z" stroke="#1f1a12" strokeWidth=".5" fill="none" />
      </g>

      {/* KITCHEN strip — bottom band, fewer stations & chefs */}
      <rect x="-380" y="156" width="760" height="64" fill="#1f1a12" fillOpacity=".06" />
      <line x1="-380" y1="168" x2="380" y2="168" stroke="#1f1a12" strokeWidth=".6" strokeDasharray="3 3" opacity=".5" />
      <g stroke="#1f1a12" strokeWidth=".7" fill="none" opacity=".5">
        {[-260,-90,90,260].map((x,i) => (
          <g key={i}>
            {/* hood above each station */}
            <path d={`M${x-30} 164 L${x-24} 158 L${x+24} 158 L${x+30} 164`} />
            <path d={`M${x-6} 158 q-2 -4 0 -8 q2 -4 0 -8`} opacity=".4" />
            <path d={`M${x+6} 158 q-2 -4 0 -8 q2 -4 0 -8`} opacity=".4" />
          </g>
        ))}
      </g>
      {/* grill flames at each station */}
      <g fill="#d97a3c" fillOpacity=".55" stroke="#1f1a12" strokeWidth=".5">
        {[-260,-90,90,260].map((x,i) => (
          <g key={i}>
            <path d={`M${x-16} 178 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 q3 -8 6 -2 l0 4 l-30 0 z`} />
          </g>
        ))}
      </g>
      {/* CHEF FIGURES — four, more human-shaped */}
      <g opacity=".88">
        {[
          { x: -260, facing: 1 },
          { x: -90, facing: 1 },
          { x: 90, facing: -1 },
          { x: 260, facing: -1 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.x} 200)`}>
            {/* shoulders/torso — trapezoid white apron */}
            <path d="M-13 0 L-10 -22 L10 -22 L13 0 Z" fill="#f3ead8" stroke="#1f1a12" strokeWidth=".7" />
            {/* apron strap */}
            <line x1="-6" y1="-22" x2="-6" y2="-2" stroke="#1f1a12" strokeWidth=".4" opacity=".6" />
            <line x1="6" y1="-22" x2="6" y2="-2" stroke="#1f1a12" strokeWidth=".4" opacity=".6" />
            {/* neck */}
            <line x1="-2" y1="-22" x2="-2" y2="-26" stroke="#1f1a12" strokeWidth="1.2" />
            <line x1="2" y1="-22" x2="2" y2="-26" stroke="#1f1a12" strokeWidth="1.2" />
            {/* head */}
            <circle cx="0" cy="-31" r="4.2" fill="#e8d4b0" stroke="#1f1a12" strokeWidth=".7" />
            {/* face hint — small dot for nose, light shadow under hat */}
            <line x1="-2" y1="-31" x2="-1" y2="-30" stroke="#1f1a12" strokeWidth=".5" />
            {/* chef hat — puffy toque */}
            <path d="M-5 -35 q-3 -2 -3 -6 q0 -5 4 -5 q1 -3 4 -3 q3 0 4 3 q4 0 4 5 q0 4 -3 6 z" fill="#f3ead8" stroke="#1f1a12" strokeWidth=".7" />
            <line x1="-5" y1="-35" x2="5" y2="-35" stroke="#1f1a12" strokeWidth=".5" />
            {/* shoulder + upper arm reaching toward grill */}
            <path d={`M${c.facing*10} -20 Q${c.facing*16} -14 ${c.facing*18} -8`} stroke="#1f1a12" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* forearm */}
            <path d={`M${c.facing*18} -8 Q${c.facing*22} -4 ${c.facing*24} 2`} stroke="#1f1a12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            {/* hand + utensil */}
            <circle cx={c.facing*24} cy="2" r="1.4" fill="#e8d4b0" stroke="#1f1a12" strokeWidth=".5" />
            <line x1={c.facing*24} y1="2" x2={c.facing*32} y2="-2" stroke="#1f1a12" strokeWidth="1" />
            <rect x={c.facing > 0 ? 31 : -34} y="-4" width="3" height="3" stroke="#1f1a12" strokeWidth=".5" fill="none" />
          </g>
        ))}
      </g>
      {/* fish on the grill */}
      <g stroke="#1f1a12" strokeWidth=".6" fill="none" opacity=".55">
        {[-260,-90,90,260].map((x,i) => (
          <g key={i} transform={`translate(${x} 174)`}>
            <path d="M-7 0 q3 -3 7 0 q4 3 7 0 l-3 0 l3 3 l-3 0 q-4 -3 -7 0 q-4 3 -7 0 z" />
          </g>
        ))}
      </g>
      <text x="-360" y="212" fontFamily="Spectral, serif" fontStyle="italic" fontSize="11" fill="#1f1a12" opacity=".55">mutfak — ızgara</text>

      {/* hand label */}
      <text x="-360" y="-200" fontFamily="Spectral, serif" fontStyle="italic" fontSize="13" fill="#1f1a12" opacity=".55">Çalış sahili</text>

      {/* boats — two now, one closer one further */}
      <g transform="translate(120 -150)" stroke="#1f1a12" strokeWidth=".8" fill="none" opacity=".55">
        <path d="M-10 0 q10 4 20 0 l-2 -4 l-16 0 z" />
        <line x1="0" y1="0" x2="0" y2="-14" />
        <path d="M0 -14 l8 12 l-8 0 z" />
      </g>
      <g transform="translate(280 -110)" stroke="#1f1a12" strokeWidth=".6" fill="none" opacity=".4">
        <path d="M-7 0 q7 3 14 0 l-1.5 -3 l-11 0 z" />
        <line x1="0" y1="0" x2="0" y2="-10" />
        <path d="M0 -10 l5 8 l-5 0 z" />
      </g>

      {/* gulls — tiny v-strokes far away */}
      <g stroke="#1f1a12" strokeWidth=".5" fill="none" opacity=".5">
        <path d="M-60 -200 q3 -3 6 0 q3 -3 6 0" />
        <path d="M-30 -180 q2 -2 4 0 q2 -2 4 0" />
        <path d="M40 -210 q3 -3 6 0 q3 -3 6 0" />
      </g>
    </g>
  );
}

function GardenBackdrop() {
  return (
    <g opacity=".7">
      {/* ground stroke */}
      <path d="M-260 -90 L260 -90 L260 80 L-260 80 Z" stroke="#1f1a12" strokeWidth=".6" strokeDasharray="3 4" fill="none" opacity=".4" />
      {/* string lights overhead */}
      <path d="M-260 -120 Q-100 -98 80 -110 T280 -108" stroke="#1f1a12" strokeWidth=".7" fill="none" opacity=".55" />
      <g fill="#d97a3c" fillOpacity=".7">
        {[-220,-170,-120,-70,-20,30,80,130,180,230].map((x,i) => (
          <circle key={i} cx={x} cy={-110 + Math.sin(i)*4} r="2" />
        ))}
      </g>
      {/* trees */}
      <g stroke="#1f1a12" strokeWidth=".7" fill="none" opacity=".5">
        <g transform="translate(-240 50)">
          <path d="M0 0 q-12 -20 0 -36 q12 16 0 36 z" />
          <line x1="0" y1="0" x2="0" y2="14" />
        </g>
        <g transform="translate(240 60)">
          <path d="M0 0 q-12 -20 0 -36 q12 16 0 36 z" />
          <line x1="0" y1="0" x2="0" y2="14" />
        </g>
      </g>
      <text x="-240" y="-130" fontFamily="Spectral, serif" fontStyle="italic" fontSize="13" fill="#1f1a12" opacity=".55">Bahçe — dış mekân</text>
    </g>
  );
}

function IndoorBackdrop({ floor }) {
  return (
    <g opacity=".7">
      {/* room outline */}
      <path d="M-130 -90 L130 -90 L130 80 L-130 80 Z" stroke="#1f1a12" strokeWidth=".8" fill="rgba(255,255,255,.25)" />
      {/* windows */}
      <g stroke="#1f1a12" strokeWidth=".6" fill="none" opacity=".55">
        <line x1="-90" y1="-90" x2="-50" y2="-90" />
        <line x1="-30" y1="-90" x2="10" y2="-90" />
        <line x1="30" y1="-90" x2="70" y2="-90" />
      </g>
      {/* door / stair */}
      {floor === 'main' ? (
        <g stroke="#1f1a12" strokeWidth=".6" fill="none" opacity=".55">
          <rect x="100" y="60" width="22" height="18" />
          <text x="105" y="74" fontFamily="Spectral, serif" fontSize="9" fill="#1f1a12" opacity=".7" stroke="none">↑</text>
          <text x="80" y="98" fontFamily="Spectral, serif" fontStyle="italic" fontSize="10" fill="#1f1a12" opacity=".55" stroke="none">merdiven</text>
        </g>
      ) : (
        <g stroke="#1f1a12" strokeWidth=".6" fill="none" opacity=".55">
          <rect x="100" y="60" width="22" height="18" />
          <text x="78" y="98" fontFamily="Spectral, serif" fontStyle="italic" fontSize="10" fill="#1f1a12" opacity=".55" stroke="none">üst kat sahanlığı</text>
        </g>
      )}
      {/* kitchen pass */}
      <g stroke="#1f1a12" strokeWidth=".6" fill="none" opacity=".4" strokeDasharray="2 3">
        <line x1="-130" y1="60" x2="-50" y2="60" />
        <text x="-128" y="76" fontFamily="Spectral, serif" fontStyle="italic" fontSize="10" fill="#1f1a12" stroke="none" opacity=".7">mutfak</text>
      </g>
      <text x="-130" y="-105" fontFamily="Spectral, serif" fontStyle="italic" fontSize="13" fill="#1f1a12" opacity=".55">
        {floor === 'main' ? 'İç salon — zemin' : 'İç salon — üst kat'}
      </text>
    </g>
  );
}

// ─── Top-level Map ────────────────────────────────────────────────────────
function IsoMap({ atmos, region, floor, selected, onSelect }) {
  const [hover, setHover] = React.useState(null);
  const onHover = (id, label, c) => setHover({ id, label, x: c.sx, y: c.sy });
  const onLeave = () => setHover(null);

  const tables =
    region === 'sea' ? buildSeaTables() :
    region === 'garden' ? buildGardenTables() :
    region === 'indoor' ? buildIndoorTables(floor) :
    [];
  const taken = new Set(TAKEN_BY_ATMOS[atmos][region === 'indoor' && floor === 'upper' ? 'upper' : region] || []);
  const recommended = new Set(RECOMMENDED_BY_ATMOS[atmos] || []);

  // viewBox sized so projected coords fit
  const vbW = 760, vbH = 460;

  // Sea region uses a flat top-down layout, anchored to the bottom of the canvas.
  // Other regions remain isometric.
  const seaRows = (() => {
    if (region !== 'sea') return null;
    return tables.map((t, i) => {
      const row = Math.floor(i / 10);
      const col = i % 10;
      const x = -315 + col * 70;
      const y = -38 + row * 32;            // pulled up toward sea
      return { ...t, fx: x, fy: y };
    });
  })();

  // Indoor tables shown in the same 'sea' overview — 4 rows × 5 inside the indoor band
  const indoorOverlay = (() => {
    if (region !== 'sea') return null;
    const indoor = buildIndoorTables('ground');
    const takenIndoor = new Set(TAKEN_BY_ATMOS[atmos]['indoor'] || []);
    return indoor.slice(0, 20).map((t, i) => {
      const row = Math.floor(i / 5);       // 0..3
      const col = i % 5;                   // 0..4
      const x = -240 + col * 120;
      const y = 88 + row * 14;
      let status = 'free';
      if (takenIndoor.has(t.id)) status = 'taken';
      else if (selected === t.id) status = 'selected';
      else if (recommended.has(t.id)) status = 'recommended';
      return { ...t, fx: x, fy: y, status };
    });
  })();

  return (
    <div className="iso-canvas">
      <svg className="iso" viewBox={`-${vbW/2} -${vbH/2} ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid meet">
        {/* ground tone band */}
        <defs>
          <linearGradient id="groundwash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3ead8" stopOpacity="0" />
            <stop offset="100%" stopColor="#ead9b8" stopOpacity=".6" />
          </linearGradient>
        </defs>
        <rect x={-vbW/2} y={-vbH/2} width={vbW} height={vbH} fill="url(#groundwash)" />

        {region === 'sea' && <SeaBackdrop />}
        {region === 'garden' && <GardenBackdrop />}
        {region === 'indoor' && <IndoorBackdrop floor={floor} />}

        {/* tables */}
        <g>
          {region === 'sea' ? seaRows.map((t) => {
            let status = 'free';
            if (taken.has(t.id)) status = 'taken';
            else if (selected === t.id) status = 'selected';
            else if (recommended.has(t.id)) status = 'recommended';
            return (
              <FlatTable key={t.id} id={t.id} label={t.label} x={t.fx} y={t.fy} status={status}
                         onSelect={onSelect} onHover={onHover} onLeave={onLeave} />
            );
          }) : null}
          {region === 'sea' && indoorOverlay && indoorOverlay.map((t) => (
            <FlatTable key={`in-${t.id}`} id={t.id} label={t.label} x={t.fx} y={t.fy} status={t.status}
                       onSelect={onSelect} onHover={onHover} onLeave={onLeave} />
          ))}
          {region !== 'sea' ? tables.map((t) => {
            let status = 'free';
            if (taken.has(t.id)) status = 'taken';
            else if (selected === t.id) status = 'selected';
            else if (recommended.has(t.id)) status = 'recommended';
            return (
              <Table key={t.id} {...t} status={status}
                     onSelect={onSelect} onHover={onHover} onLeave={onLeave} />
            );
          }) : null}
        </g>

        {/* atmosphere-only signature note bottom-right */}
        <text x={vbW/2 - 16} y={vbH/2 - 14} textAnchor="end"
              fontFamily="Spectral, serif" fontStyle="italic" fontSize="11"
              fill="#1f1a12" opacity=".4">
          {atmos === 'sunset' ? '— ışık 18:42 civarı' : atmos === 'dinner' ? '— ana servis' : '— gece sakinliği'}
        </text>
      </svg>

      {hover && (
        <div className="table-tip show"
             style={{
               left: `calc(50% + ${hover.x * (100 / 760)}%)`,
               top: `calc(50% + ${hover.y * (100 / 460)}%)`,
             }}>
          {hover.label}
        </div>
      )}
    </div>
  );
}

window.IsoMap = IsoMap;
