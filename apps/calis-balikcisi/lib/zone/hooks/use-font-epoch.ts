'use client';

import { useEffect, useState } from 'react';

import { readBrand } from '@/lib/zone/brand';
import { redrawTextTextures } from '@/lib/zone/textures';

/**
 * Font tuzağı (docs/zone-3d-modul.md bölüm 9): canvas'a yazılan marka fontu geç yüklenir.
 * Font hazır olunca sayaç artar; yazılı dokular yuva anahtarına bu sayacı katar ve yeniden
 * çizilir. setState promise callback'inde — effect içinde senkron değil.
 */
export function useFontEpoch(): number {
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const brand = readBrand();
    void redrawTextTextures([`600 64px ${brand.displayFont}`, `400 26px ${brand.bodyFont}`], () => {
      if (!cancelled) setEpoch((e) => e + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return epoch;
}
