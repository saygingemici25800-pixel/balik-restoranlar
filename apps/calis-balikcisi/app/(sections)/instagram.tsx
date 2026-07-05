import { WebVideo } from '../_components/web-video';

const R2 = 'https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev/web';

/**
 * Instagram davet bölümü. Asimetrik "merdiven": sol video büyük ve yukarıda,
 * sağ video küçük ve aşağı kaydırılmış. Dikey 9:16 videolar SESSİZ + loop
 * (WebVideo → yalnız görünürken oynar). Yanında @calisbalikcisi başlığı,
 * davet cümlesi ve takip butonu.
 */
export function Instagram() {
  return (
    <section
      className="py-24 md:py-32 px-6 md:px-10"
      aria-labelledby="instagram-title"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Metin */}
        <div className="order-2 md:order-1">
          <span className="eyebrow">Instagram</span>
          <h2
            id="instagram-title"
            className="mt-4 font-display font-bold tracking-[-0.01em] text-4xl md:text-5xl leading-tight text-fg"
          >
            @calisbalikcisi
          </h2>
          <p className="mt-6 text-fg/75 leading-relaxed max-w-md">
            Tezgâhın tazesi, köz üstündeki balık ve sahildeki akşamlar — günlük
            kareler Instagram&apos;da. Takip edin, sofradan haberdar olun.
          </p>
          <a
            href="https://www.instagram.com/calisbalikcisi/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-8 border border-accent/50 text-accent px-7 py-3.5 text-xs uppercase tracking-[0.25em] hover:bg-accent hover:text-bg transition-colors duration-300"
          >
            Instagram&apos;da Takip Et
          </a>
        </div>

        {/* Asimetrik merdiven: sol büyük+yukarı, sağ küçük+aşağı */}
        <div className="order-1 md:order-2 flex items-start justify-center gap-4 md:gap-6">
          <div className="w-[54%] relative aspect-[9/16] overflow-hidden rounded-sm bg-fg/5">
            <WebVideo
              src={`${R2}/insta-1.mp4`}
              poster="/web/insta-1.webp"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="w-[42%] mt-12 md:mt-24 relative aspect-[9/16] overflow-hidden rounded-sm bg-fg/5">
            <WebVideo
              src={`${R2}/insta-2.mp4`}
              poster="/web/insta-2.webp"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
