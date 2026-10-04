'use client';

import { useEffect } from 'react';

import { pressKey, releaseAllInput, releaseKey } from '@/lib/zone/runtime';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Klavye → `lib/zone/runtime` (docs/zone-3d-modul.md bölüm 8.2). MANCH'ten; tek fark tuşların
 * `e.code` ile tutulması ve değiştirici tuşların (Cmd/Ctrl/Option) hareket sayılmaması.
 *
 * **Dinleyici HER ZAMAN bağlı kalır; tuşlar duruma göre süzülür.** POV'da dinleyiciyi tümden
 * kaldırmak `Esc`'i de öldürür — panoya girilip çıkılamaz. Kapatılan şey hareket, çıkış değil.
 *
 * `<Canvas>` DIŞINDA çağrılır: pencere olayları sahneye ait değil.
 */

/** Sayfa kaydırmasın diye engellenen tuşlar (`e.code`, küçük harf). */
const SCROLLERS = new Set(['space', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);

/**
 * Tuşlar `e.code` ile (fiziksel konum) tutulur, `e.key` ile değil: macOS'ta Option `e.key`'i
 * değiştirir (A basılıyken Option → keyup 'å') ve bırakılan tuş eşleşmez, takılı kalırdı.
 * Fiziksel konum ayrıca AZERTY gibi düzenlerde de WASD'yi aynı yerde tutar.
 */
const codeOf = (e: KeyboardEvent) => e.code.toLowerCase();

export function useZoneControls() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const zone = useZoneStore.getState();

      // Esc her durumda duyulur: POV'dan çıkışın tek klavye yolu. Zone'dan çıkış kapıda.
      if (e.key === 'Escape') {
        // POV'da Esc yalnız panoyu kapatır: `preventDefault` ile işaretlenir, kapı (ZoneGate) aynı
        // tuşla Zone'dan da çıkmasın diye `defaultPrevented`'a bakar.
        if (zone.state === 'pov') {
          zone.closeFrame();
          e.preventDefault();
        }
        return;
      }
      // POV'da (ve Zone kapalıyken) hareket girdisi yok.
      if (zone.state !== 'zone') return;
      // Kısayollar (Cmd+A, Ctrl+…) hareket değildir. macOS, Cmd basılıyken bırakılan tuşa
      // keyup göndermez — basılmış sayarsak tuş takılı kalır.
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = codeOf(e);
      pressKey(k);
      // Space düğme/bağlantı üzerindeyse iptal edilmez: tarayıcı iptal edilmiş Space ile düğmeyi
      // tetiklemez ("Gir" Space ile açılmıyordu — Faz 3 incelemesi). Oklar her zaman engellenir.
      const onControl =
        e.target instanceof Element &&
        e.target.closest('button, a[href], input, select, textarea, [role="button"]') !== null;
      if (SCROLLERS.has(k) && !(k === 'space' && onControl)) e.preventDefault();
      // Otomatik tekrar (E basılı tutulunca) eylem değildir: merdivende katlar arası gidip gelmesin.
      if (k === 'keye' && !e.repeat) {
        if (zone.nearFrame) zone.openFrame(zone.nearFrame);
        else if (zone.nearPortal) zone.startTravel(zone.nearPortal);
      }
    };
    const up = (e: KeyboardEvent) => {
      // Cmd bırakılınca o sırada basılı tuşların keyup'ı hiç gelmeyebilir: hepsi bırakılır.
      if (e.key === 'Meta') {
        releaseAllInput();
        return;
      }
      releaseKey(codeOf(e));
    };

    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up);
    window.addEventListener('blur', releaseAllInput);

    // POV'a geçerken basılı tuşlar bırakılır — yoksa çıkışta karakter kendiliğinden yürür.
    const unsubscribe = useZoneStore.subscribe((s, prev) => {
      if (s.state !== prev.state && s.state !== 'zone') releaseAllInput();
    });

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', releaseAllInput);
      unsubscribe();
      releaseAllInput();
    };
  }, []);
}
