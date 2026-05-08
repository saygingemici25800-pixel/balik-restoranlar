import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/rezervasyon/onay',
    },
    sitemap: 'https://calis-balikcisi.vercel.app/sitemap.xml',
  };
}
