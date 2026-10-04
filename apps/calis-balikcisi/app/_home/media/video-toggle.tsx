'use client';

import h from '../home.module.css';
import { useAmbient } from './ambient-group';

/**
 * "Videoları durdur / oynat" düğmesi — en az 44 px hedef, DM Mono etiket + simge. Etiket
 * durumla değişir (aria-pressed yok: ad zaten durumu söylüyor).
 */
type VideoToggleProps = { compact?: boolean; className?: string };

export function VideoToggle({ compact = false, className = '' }: VideoToggleProps) {
  const { paused, toggle, allFailed } = useAmbient();
  // hiçbir video açılamadıysa (ağ engeli) düğme bir şey yapmaz: gösterilmez
  if (allFailed) return null;
  const text = paused ? 'Videoları oynat' : 'Videoları durdur';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={text}
      className={`${h.label} inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full ${className}`}
    >
      <PlayPauseIcon paused={paused} />
      {compact ? null : <span aria-hidden="true">{text}</span>}
    </button>
  );
}

export function PlayPauseIcon({ paused }: { paused: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      {paused ? <path d="M2 1.5v9l8-4.5z" /> : <path d="M2 1.5h3v9H2zM7 1.5h3v9H7z" />}
    </svg>
  );
}
