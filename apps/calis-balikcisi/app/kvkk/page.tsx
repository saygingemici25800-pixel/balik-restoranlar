import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni — Çalış Balıkçısı',
  description:
    'Çalış Balıkçısı kişisel verilerin korunması aydınlatma metni. KVKK kapsamında veri işleme politikası.',
  alternates: {
    canonical: 'https://calis-balikcisi.vercel.app/kvkk',
  },
};

export default function KvkkPage() {
  return (
    <main
      data-rezervasyon
      style={{
        maxWidth: 720,
        margin: '80px auto',
        padding: '0 32px',
        fontFamily: 'var(--font-display), Georgia, serif',
        color: '#1f1a12',
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontWeight: 700, letterSpacing: '-0.01em', fontSize: '2rem', marginBottom: 24 }}>
        Kişisel Verilerin Korunması Aydınlatma Metni
      </h1>

      <p>
        Çalış Balıkçısı olarak, kişisel verilerinizin gizliliğine ve güvenliğine
        önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (&ldquo;KVKK&rdquo;) kapsamında, rezervasyon hizmetimiz için topladığımız
        verilere ilişkin sizi aydınlatmak isteriz.
      </p>

      <h2 style={{ marginTop: 32, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
        Toplanan Veriler
      </h2>
      <p>
        Rezervasyon talebiniz sırasında ad, soyad, telefon numarası ve seçim
        tercihleriniz (masa, tarih, saat, kişi sayısı) tarafımızca kaydedilir.
      </p>

      <h2 style={{ marginTop: 32, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
        Verilerin Kullanım Amacı
      </h2>
      <p>
        Bu veriler yalnızca rezervasyon onayı, masa hazırlığı ve gerektiğinde
        sizinle iletişim kurmak amacıyla kullanılır. Üçüncü taraflarla
        paylaşılmaz.
      </p>

      <h2 style={{ marginTop: 32, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
        Saklama Süresi
      </h2>
      <p>
        Rezervasyon kayıtları, hizmet kalitesini ölçmek ve yasal yükümlülükler
        doğrultusunda 1 yıl süreyle saklanır.
      </p>

      <h2 style={{ marginTop: 32, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
        Haklarınız
      </h2>
      <p>
        KVKK&apos;nın 11. maddesi kapsamında verilerinize erişim, düzeltme,
        silme ve işlemeye itiraz haklarınız bulunmaktadır. Talepleriniz için
        info@calisbalikcisi.com adresinden bize ulaşabilirsiniz.
      </p>

      <p style={{ marginTop: 48, fontWeight: 300, letterSpacing: '0.04em', opacity: 0.7 }}>
        Son güncelleme: Mayıs 2026
      </p>
    </main>
  );
}
