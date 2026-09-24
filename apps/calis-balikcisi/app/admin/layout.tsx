import type { Metadata } from 'next';

// Site chrome'u (Lenis, scroll göstergesi, footer) app/_components/site-chrome.tsx
// /admin altında hiç render etmez; burada yalnız noindex tanımlanır.
export const metadata: Metadata = {
  title: 'Menü Yönetimi — Çalış Balıkçısı',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
