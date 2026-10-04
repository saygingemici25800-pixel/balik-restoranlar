import { MetadataRoute } from 'next';
import { RES_ENABLED } from '@/lib/flags';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://calisbalikcisi.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://calisbalikcisi.com/menu',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...(RES_ENABLED
      ? ([
          {
            url: 'https://calisbalikcisi.com/rezervasyon',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
          },
        ] as MetadataRoute.Sitemap)
      : []),
    {
      url: 'https://calisbalikcisi.com/iletisim',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://calisbalikcisi.com/kvkk',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
