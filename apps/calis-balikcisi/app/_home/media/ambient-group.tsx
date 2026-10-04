'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { lowData, prefersStill } from './video-env';

/**
 * Bir bölümdeki sessiz döngü videolarını birlikte durdurur/oynatır (WCAG 2.2.2). Hareket
 * azaltılmışsa ya da veri tasarrufu açıksa grup "durdurulmuş" başlar; "Videoları oynat" isteğe
 * bağlı açar. Videolar durumlarını bildirir: hepsi açılamadıysa düğme gizlenir (işe yaramaz).
 */
type VideoStatus = 'live' | 'failed';
type GroupState = {
  paused: boolean;
  toggle: () => void;
  /** Grupta en az bir video var ve hepsi açılamadı. */
  allFailed: boolean;
  report: (id: string, status: VideoStatus | null) => void;
};

const AmbientContext = createContext<GroupState>({ paused: false, toggle: () => {}, allFailed: false, report: () => {} });

export const useAmbient = () => useContext(AmbientContext);

export function AmbientGroup({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [videos, setVideos] = useState<Record<string, VideoStatus>>({});
  useEffect(() => {
    if (prefersStill() || lowData()) setPaused(true);
  }, []);
  const toggle = useCallback(() => setPaused((p) => !p), []);
  const report = useCallback((id: string, status: VideoStatus | null) => {
    setVideos((cur) => {
      if (status === null) {
        if (!(id in cur)) return cur;
        const next = { ...cur };
        delete next[id];
        return next;
      }
      return cur[id] === status ? cur : { ...cur, [id]: status };
    });
  }, []);
  const value = useMemo(() => {
    const all = Object.values(videos);
    return { paused, toggle, report, allFailed: all.length > 0 && all.every((s) => s === 'failed') };
  }, [paused, toggle, report, videos]);
  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>;
}
