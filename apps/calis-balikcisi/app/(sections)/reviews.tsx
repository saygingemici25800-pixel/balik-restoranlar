type Review = {
  id: string;
  text: string;
  author: string;
  date: string;
};

const REVIEWS: Review[] = [
  {
    id: 'mehmet-k',
    text: '“Akif Usta’nın elinden çıkan levrek başka oluyor. 3. kez geliyoruz, her seferinde aynı tat.”',
    author: 'Mehmet K.',
    date: '2 ay önce',
  },
  {
    id: 'ayse-t',
    text: '“Sahil kenarında akşam yemeği için en doğru adres. Masamız 1 saat boş kalmadı diye stres olmadık, ekip rahat.”',
    author: 'Ayşe T.',
    date: '3 hafta önce',
  },
  {
    id: 'hasan-b',
    text: '“1987’den beri bu mekan Fethiye’nin gizli incisi. Akif Usta’yla balık üzerine sohbet etmek de ayrı bir keyif.”',
    author: 'Hasan B.',
    date: '1 ay önce',
  },
];

export function Reviews() {
  return (
    <section className="py-16 md:py-24 px-5 md:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <span className="text-xs uppercase tracking-[0.32em] text-accent/85">
          Misafirlerimiz
        </span>
        <h2 className="mt-3 mb-12 md:mb-14 font-display italic text-4xl md:text-5xl text-fg">
          Sofradan sonra söylenenler
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 text-left">
          {REVIEWS.map((review) => (
            <article
              key={review.id}
              className="rounded-sm border border-fg/10 bg-fg/[0.04] p-6 transition-colors duration-300 hover:border-fg/20 hover:bg-fg/[0.06]"
            >
              <div className="text-sm tracking-[0.1em] text-accent">★★★★★</div>
              <p className="mt-3 font-display italic text-lg leading-snug text-fg/90">
                {review.text}
              </p>
              <div className="mt-4 flex items-baseline justify-between font-body text-xs">
                <span className="text-fg/75">{review.author}</span>
                <span className="italic text-fg/45">{review.date}</span>
              </div>
            </article>
          ))}
        </div>

        <a
          href="https://maps.google.com/?q=Çalış+Balıkçısı+Fethiye"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-display italic text-sm text-fg/70 underline decoration-[0.5px] underline-offset-4 transition-colors hover:text-fg"
        >
          Tüm yorumları Google’da gör →
        </a>
      </div>
    </section>
  );
}
