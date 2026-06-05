// Admin route'u kök layout'un içinde render edilir; site footer'ı ve scroll
// kontrolleri (scroll-to-top / progress) kök layout'tan geldiği için burada
// yapısal olarak kaldırılamaz. Admin yüzeyinde görünmemeleri için bu chrome
// öğeleri CSS ile gizlenir — stil yalnızca admin layout mount edildiğinde
// (yani /admin altındayken) DOM'da bulunur. Seçiciler ilgili bileşenlerin
// gerçek işaretlemesine göre yazıldı (footer.tsx, scroll-progress.tsx,
// scroll-to-top.tsx).
const hideSiteChrome = `
  [data-global-footer],
  .scroll-progress-track,
  button[aria-label="Sayfanın başına dön"] {
    display: none !important;
  }
`;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hideSiteChrome }} />
      {children}
    </>
  );
}
