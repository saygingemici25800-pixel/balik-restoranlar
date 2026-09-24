'use client';

import { AlertCircle, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category, ContentItem } from '@/lib/content/types';
import styles from '../admin.module.css';
import { fromDraft, toDraft, type ItemDraft, type ItemInput } from './item-draft';
import { ItemFields } from './item-fields';

export type EditorTarget = { item: ContentItem | null; categoryId: string };

type ItemEditorProps = {
  target: EditorTarget;
  categories: Category[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: ItemInput) => void;
  onDelete: (id: string) => void;
};

export function ItemEditor({ target, categories, busy, error, onClose, onSave, onDelete }: ItemEditorProps) {
  const { item } = target;
  const [draft, setDraft] = useState<ItemDraft>(() => toDraft(item, target.categoryId));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  function change<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = fromDraft(draft, item?.id);
    if (typeof input === 'string') {
      setLocalError(input);
      return;
    }
    setLocalError(null);
    onSave(input);
  }

  function handleDelete() {
    if (item && window.confirm(`"${item.name.tr}" kalıcı olarak silinsin mi?`)) {
      onDelete(item.id);
    }
  }

  const shownError = localError ?? error;

  return (
    <div className={styles.overlay} onClick={() => !busy && onClose()} role="presentation">
      <div
        className={`${styles.modal} ${styles.modalWide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle} id="item-editor-title">
          {item ? 'Ürünü düzenle' : 'Yeni ürün'}
        </h2>
        <p className={styles.modalSub}>Kaydedince menüde hemen görünür.</p>

        <form onSubmit={handleSubmit}>
          <ItemFields draft={draft} categories={categories} onChange={change} />

          {shownError ? (
            <p className={styles.errorBanner} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              {shownError}
            </p>
          ) : null}

          <div className={styles.modalActions}>
            {item ? (
              <button type="button" className={`${styles.btnGhost} ${styles.btnDangerText}`} onClick={handleDelete} disabled={busy}>
                <Trash2 size={16} aria-hidden="true" />
                Sil
              </button>
            ) : null}
            <span className={styles.spacer} />
            <button type="button" className={styles.btnGhost} onClick={onClose} disabled={busy}>
              <X size={16} aria-hidden="true" />
              Vazgeç
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={busy}>
              {busy ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
