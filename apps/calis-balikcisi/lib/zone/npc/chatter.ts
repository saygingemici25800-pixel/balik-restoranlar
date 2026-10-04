/**
 * Kendi kendine konuşma — satır seçimi ve kurallar (three'siz). Karşılıklı sohbet YOK: her
 * balon tek satır, kimseye cevap vermez (karar 2026-10-02).
 *
 * Seçim: konuşanın dili, yeri (masa/sahil yolu/kumsal/yan), yaş grubu, duruşu (oturan/ayakta/
 * yürüyen), kapalı alanda olup olmadığı ve masadaysa yemeğin aşaması — satır konuşanla çelişmesin. Çocuk yalnız çocuk satırlarını, yaşlı kendi satırlarını ve genel satırları söyler.
 * Son 24 satır tekrar edilmez (havuz yetmezse en eskisi açılır).
 */
import { LINE_STAGES, NPC_LINES, type NpcLine } from './lines';
import type { Rng } from './rng';
import type { Talk, TalkZone } from './roster';

const RECENT = 24;

export function pickLine(talk: Talk, recent: string[], rng: Rng): NpcLine | null {
  const stages = talk.stage ? LINE_STAGES[talk.stage] : null;
  const enclosed = talk.zone === 'indoor' || talk.zone === 'upper';
  const fits = (l: NpcLine) =>
    l.lang === talk.lang &&
    l.where.includes(talk.place) &&
    (talk.who === 'kid' ? l.who === 'kid' : l.who === 'any' || l.who === talk.who) &&
    (!stages || stages.includes(l.stage)) &&
    (!l.pose || l.pose.includes(talk.pose)) &&
    !(l.open && enclosed);
  const pool = NPC_LINES.filter(fits);
  if (pool.length === 0) return null;
  const fresh = pool.filter((l) => !recent.includes(l.id));
  const from = fresh.length > 0 ? fresh : pool;
  const line = from[Math.floor(rng() * from.length)] ?? null;
  if (line) {
    recent.push(line.id);
    if (recent.length > RECENT) recent.shift();
  }
  return line;
}

/**
 * Oyuncunun bulunduğu yerden GÖRÜLEN alanlar: içerideyken yalnız salon; dışarıda teras, sahil
 * yolu, kumsal, yanlar; üst katta üst kat, sahanlık ve camın ötesindeki sahil. Duvarın/tavanın
 * arkasındaki biri "konuşmasın" (ışın testi yerine ucuz kural).
 */
const ZONES_UPPER: readonly TalkZone[] = ['upper', 'landing', 'promenade', 'beach'];
const ZONES_INSIDE: readonly TalkZone[] = ['indoor'];
const ZONES_OUTSIDE: readonly TalkZone[] = ['outdoor', 'promenade', 'beach', 'side'];

export function visibleZones(level: 0 | 1, inside: boolean): readonly TalkZone[] {
  if (level === 1) return ZONES_UPPER;
  return inside ? ZONES_INSIDE : ZONES_OUTSIDE;
}

/** Balonun ekranda kalma süresi (sn): okunacak kadar, sıkacak kadar değil. */
export const lineDuration = (text: string, reduced: boolean) =>
  Math.min(4.6, Math.max(2.6, 1.8 + 0.05 * text.length)) * (reduced ? 1.25 : 1);
