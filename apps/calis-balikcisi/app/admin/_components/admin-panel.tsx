'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ContentSource } from '@/lib/content/store';
import type { SiteContent } from '@/lib/content/types';
import {
  addCategoryAction,
  deleteCategoryAction,
  deleteItemAction,
  saveItemAction,
  setItemHiddenAction,
  type ActionResult,
} from '../actions';
import styles from '../admin.module.css';
import { AddCategoryForm } from './add-category-form';
import { CategoryCard } from './category-card';
import { ItemEditor, type EditorTarget } from './item-editor';

type AdminPanelProps = {
  initialContent: SiteContent;
  status: 'ok' | 'empty' | 'error';
  source: ContentSource;
  loadError: string | null;
};

export function AdminPanel({ initialContent, status, source, loadError }: AdminPanelProps) {
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditorTarget | null>(null);
  const readOnly = status === 'error';

  function openEditor(target: EditorTarget) {
    setError(null);
    setNotice(null);
    setEditing(target);
  }

  const categories = useMemo(
    () => [...content.categories].sort((a, b) => a.order - b.order),
    [content.categories],
  );

  // Tüm değişiklikler buradan geçer: panelin gördüğü sürümü (updatedAt) gönderir.
  async function run(
    action: (base: string) => Promise<ActionResult>,
    success: string,
  ): Promise<boolean> {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await action(content.updatedAt);
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      setContent(result.content);
      setNotice(success);
      return true;
    } catch (err) {
      console.error('[admin] işlem başarısız:', err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={styles.toolbar}>
        <h2 className={styles.toolbarTitle}>Menü</h2>
        <span className={styles.sourceTag}>
          {source === 'blob' ? 'Vercel Blob' : 'Lokal dosya'} ·{' '}
          {content.items.length} ürün
        </span>
      </div>

      {readOnly ? (
        <p className={styles.errorBanner} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          İçerik okunamadı, kayıt kilitli: {loadError}
        </p>
      ) : null}
      {status === 'empty' && !content.updatedAt ? (
        <p className={styles.infoBanner}>
          <Info size={16} aria-hidden="true" />
          Kaydedilmemiş başlangıç verisi (mevcut menüden). İlk kayıtta dosya oluşur.
        </p>
      ) : null}
      {error ? (
        <p className={styles.errorBanner} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className={styles.noticeBanner} role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          {notice}
        </p>
      ) : null}

      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          items={content.items.filter((i) => i.categoryId === category.id)}
          disabled={busy || readOnly}
          onEdit={(item) => openEditor({ item, categoryId: category.id })}
          onAdd={() => openEditor({ item: null, categoryId: category.id })}
          onToggleHidden={(item) =>
            run(
              (base) => setItemHiddenAction(base, item.id, !item.hidden),
              item.hidden ? `"${item.name.tr}" gösteriliyor.` : `"${item.name.tr}" gizlendi.`,
            )
          }
          onDelete={() =>
            run((base) => deleteCategoryAction(base, category.id), 'Kategori silindi.')
          }
        />
      ))}

      <AddCategoryForm
        disabled={busy || readOnly}
        onAdd={(title) => run((base) => addCategoryAction(base, title), 'Kategori eklendi.')}
      />

      {editing ? (
        <ItemEditor
          target={editing}
          categories={categories}
          busy={busy}
          error={error}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            if (await run((base) => saveItemAction(base, input), 'Kaydedildi.')) setEditing(null);
          }}
          onDelete={async (id) => {
            if (await run((base) => deleteItemAction(base, id), 'Ürün silindi.')) setEditing(null);
          }}
        />
      ) : null}
    </>
  );
}
