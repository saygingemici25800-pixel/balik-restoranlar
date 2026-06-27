import { MetadataRoute } from 'next';
import { RES_ENABLED } from '@/lib/flags';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://calis-balikcisi.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://calis-balikcisi.vercel.app/menu',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...(RES_ENABLED
      ? ([
          {
            url: 'https://calis-balikcisi.vercel.app/rezervasyon',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
          },
        ] as MetadataRoute.Sitemap)
      : []),
    {
      url: 'https://calis-balikcisi.vercel.app/iletisim',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://calis-balikcisi.vercel.app/kvkk',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
