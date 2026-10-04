import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/rezervasyon/onay', '/admin'],
    },
    sitemap: 'https://calisbalikcisi.com/sitemap.xml',
  };
}
