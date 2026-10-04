import { IntroStage } from './intro-stage';

/**
 * Ana sayfa açılışı: markanın 3–4 saniyelik künyesi (gün batımı, sıçrayan balık, tabela) ve
 * hero'ya kesintisiz geçiş. Satır içi betik sahneden ÖNCE çalışır:
 * - oturumda görüldüyse ya da hareket azaltılmışsa sahne ilk boyamada hiç görünmez;
 * - kaydırma kilidini kendisi koyar ve süre dolunca kendisi kaldırır (JS gecikse/yüklenmese de
 *   sayfa donmaz); oturum işaretini burada yazar (yarıda yenilenirse tekrar oynamaz).
 */
const BOOT = `(function(){var d=document.documentElement,w=window,run=true;w.__introT0=performance.now();try{if(w.matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('calis-intro'))run=false;else sessionStorage.setItem('calis-intro','1')}catch(e){}d.dataset.intro=run?'run':'seen';if(run){d.dataset.introLock='';w.__introUnlock=setTimeout(function(){delete d.dataset.introLock},3800)}})();`;

export function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <IntroStage />
    </>
  );
}
