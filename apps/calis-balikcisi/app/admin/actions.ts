'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';
import { MENU_TAG } from '@/lib/content/menu';
import { slugify, uniqueId } from '@/lib/content/slug';
import { readContent, writeContent } from '@/lib/content/store';
import {
  itemSchema,
  type ContentItem,
  type SiteContent,
} from '@/lib/content/types';

export type ActionResult =
  | { ok: true; content: SiteContent }
  | { ok: false; error: string };

// Panelden gelen ürün: id yeni üründe yok; order ve mediaSlug sunucuda korunur.
const itemInputSchema = itemSchema
  .omit({ order: true, mediaSlug: true })
  .extend({ id: itemSchema.shape.id.optional() });

const categoryTitleSchema = z.string().trim().min(1, 'Kategori adı zorunlu').max(80);

function fail(error: string): ActionResult {
  return { ok: false, error };
}

function zodMessage(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(' · ');
}

function visibilityError(item: ContentItem): string | null {
  if (!item.hidden && !item.dailyPrice && item.price === null) {
    return `"${item.name.tr}" için fiyat girin ya da "Günlük fiyat" işaretleyin.`;
  }
  return null;
}

function nextOrder(items: { order: number }[]): number {
  return items.reduce((max, i) => Math.max(max, i.order), -1) + 1;
}

// Oku -> sürüm kontrolü -> değiştir -> yaz -> revalidate. `base`, panelin
// gördüğü updatedAt'tir; farklıysa başka bir sekme/cihaz araya girmiştir.
async function mutate(
  base: string,
  change: (content: SiteContent) => SiteContent | string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const current = await readContent();
    if (current.status === 'error') {
      return fail(`İçerik okunamadı, kayıt yapılmadı: ${current.error}`);
    }
    if (current.content.updatedAt !== base) {
      return fail('Menü başka bir yerde değişmiş. Sayfayı yenileyip tekrar deneyin.');
    }
    const next = change(structuredClone(current.content));
    if (typeof next === 'string') return fail(next);

    const saved = await writeContent(next);
    revalidateTag(MENU_TAG);
    revalidatePath('/menu');
    return { ok: true, content: saved };
  } catch (err) {
    console.error('[admin] kayıt başarısız:', err);
    return fail(err instanceof Error ? err.message : String(err));
  }
}

export async function saveItemAction(base: string, input: unknown): Promise<ActionResult> {
  const parsed = itemInputSchema.safeParse(input);
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const data = parsed.data;

  return mutate(base, (content) => {
    if (!content.categories.some((c) => c.id === data.categoryId)) {
      return 'Kategori bulunamadı.';
    }
    const inCategory = content.items.filter((i) => i.categoryId === data.categoryId);
    const existing = data.id ? content.items.find((i) => i.id === data.id) : undefined;
    if (data.id && !existing) return 'Ürün bulunamadı; silinmiş olabilir.';

    const item: ContentItem = {
      ...data,
      id:
        existing?.id ??
        uniqueId(
          `${data.categoryId}-${slugify(data.name.tr)}`,
          new Set(content.items.map((i) => i.id)),
        ),
      mediaSlug: existing?.mediaSlug,
      order:
        existing && existing.categoryId === data.categoryId
          ? existing.order
          : nextOrder(inCategory),
    };
    const problem = visibilityError(item);
    if (problem) return problem;

    content.items = existing
      ? content.items.map((i) => (i.id === item.id ? item : i))
      : [...content.items, item];
    return content;
  });
}

export async function setItemHiddenAction(
  base: string,
  id: string,
  hidden: boolean,
): Promise<ActionResult> {
  return mutate(base, (content) => {
    const item = content.items.find((i) => i.id === id);
    if (!item) return 'Ürün bulunamadı; silinmiş olabilir.';
    item.hidden = hidden;
    return visibilityError(item) ?? content;
  });
}

export async function deleteItemAction(base: string, id: string): Promise<ActionResult> {
  return mutate(base, (content) => {
    if (!content.items.some((i) => i.id === id)) return 'Ürün bulunamadı.';
    content.items = content.items.filter((i) => i.id !== id);
    return content;
  });
}

export async function addCategoryAction(base: string, title: unknown): Promise<ActionResult> {
  const parsed = categoryTitleSchema.safeParse(title);
  if (!parsed.success) return fail(zodMessage(parsed.error));
  const name = parsed.data;

  return mutate(base, (content) => {
    const id = uniqueId(slugify(name), new Set(content.categories.map((c) => c.id)));
    content.categories.push({
      id,
      title: name,
      eyebrow: name.toLocaleUpperCase('tr'),
      listLabel: `— Tüm ${name} —`,
      order: nextOrder(content.categories),
    });
    return content;
  });
}

export async function deleteCategoryAction(base: string, id: string): Promise<ActionResult> {
  return mutate(base, (content) => {
    const count = content.items.filter((i) => i.categoryId === id).length;
    if (count > 0) {
      return `Bu kategoride ${count} ürün var. Önce ürünleri silin ya da başka kategoriye taşıyın.`;
    }
    content.categories = content.categories.filter((c) => c.id !== id);
    return content;
  });
}
