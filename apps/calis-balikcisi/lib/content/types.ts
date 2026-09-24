import { z } from 'zod';

// site-content.json şeması. Tek doğruluk kaynağı: panel yazarken, site okurken
// aynı şemayla doğrulanır.

export const UNITS = ['portion', 'kg'] as const;

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Geçersiz kimlik');

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v.startsWith('/') || v.startsWith('https://'), {
    message: 'Görsel URL "/" veya "https://" ile başlamalı',
  });

export const localizedNameSchema = z.object({
  tr: z.string().trim().min(1, 'Türkçe ad zorunlu').max(120),
  en: optionalText(120),
  ar: optionalText(120),
});

export const categorySchema = z.object({
  id: slugSchema,
  title: z.string().trim().min(1, 'Kategori adı zorunlu').max(80),
  eyebrow: z.string().trim().max(80),
  listLabel: z.string().trim().max(120),
  order: z.number().int(),
});

export const itemSchema = z.object({
  id: slugSchema,
  categoryId: slugSchema,
  name: localizedNameSchema,
  description: optionalText(300),
  longDescription: optionalText(1000),
  price: z.number().nonnegative().max(1_000_000).nullable(),
  unit: z.enum(UNITS),
  dailyPrice: z.boolean(),
  imageUrl: imageUrlSchema.optional(),
  mediaSlug: slugSchema.optional(),
  featured: z.boolean(),
  hidden: z.boolean(),
  order: z.number().int(),
});

export const siteContentSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  categories: z.array(categorySchema),
  items: z.array(itemSchema),
});

export type Unit = (typeof UNITS)[number];
export type Category = z.infer<typeof categorySchema>;
export type ContentItem = z.infer<typeof itemSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
