import Link from 'next/link';

import { WebVideo } from '../_components/web-video';

export function Concept() {
  return (
    <section>
      <div className="px-6 md:px-10 pt-24 md:pt-32 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-fg/5">
            <WebVideo
              src="https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev/web/ic-mekan.mp4"
              poster="/web/ic-mekan.webp"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display font-bold tracking-[-0.01em] text-4xl md:text-5xl leading-tight text-fg">
              Denizin En Yalın Hâli
            </h2>
            <div className="mt-16 space-y-6 text-fg/80 leading-relaxed">
              <p>
                1999 yılında deniz ürünlerine olan tutkumuzla yola çıktık. 2014&apos;te Fethiye&apos;de &quot;İzmir Balıkçısı&quot; markasını kurarak, en taze lezzetleri misafirlerimizle buluşturduk.
              </p>
              <p>
                2020&apos;de, bu deneyimi bir adım ileri taşıyarak, Çalış Bölgesi&apos;nde &quot;Çalış Balıkçısı&quot; markasını hayata geçirdik.
              </p>
              <p>
                Bugün de aynı tutkuyla, denizden gelen en özel tatları sizlerle buluşturmaya devam ediyoruz. Geçmişimizin tecrübesini, geleceğe yönelik yenilikçi bakış açımızla harmanlayarak, misafirlerimize en iyi deneyimi sunmaya devam ediyoruz.
              </p>
              <p>
                Lezzet, kalite ve huzurun bir araya geldiği restoranımızda, sizleri ağırlamaktan mutluluk duyarız.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-block mt-10 text-xs uppercase tracking-[0.3em] text-accent hover:text-fg transition-colors"
            >
              Sofrayı Gör →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
