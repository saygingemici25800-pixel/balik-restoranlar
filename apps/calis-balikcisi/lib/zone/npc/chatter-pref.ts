/**
 * "Konuşmalar açık/kapalı" tercihi — küçük harici kaynak (`useSyncExternalStore`). Zone store'u
 * ana sayfa paketinde olduğu için ona eklenmez; bu modül yalnız tembel Zone paketinde.
 * Kendi kendine güncellenen içeriği durdurabilme (WCAG 2.2.2).
 */
let on = true;
const subs = new Set<() => void>();

export const chatterOn = () => on;

export function setChatter(value: boolean) {
  on = value;
  subs.forEach((f) => f());
}

export function subscribeChatter(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

/** Dev/QA: gösterilen balonlar (yalnız sayı ve metin — kimlik yok). */
export const chatLog = { shown: 0, active: [] as { text: string; lang: string; zone: string }[] };
