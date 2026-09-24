'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Category, ContentItem } from '@/lib/content/types';
import styles from '../admin.module.css';
import { ItemRow } from './item-row';

type CategoryCardProps = {
  category: Category;
  items: ContentItem[];
  disabled: boolean;
  onEdit: (item: ContentItem) => void;
  onAdd: () => void;
  onToggleHidden: (item: ContentItem) => void;
  onDelete: () => void;
};

export function CategoryCard({
  category,
  items,
  disabled,
  onEdit,
  onAdd,
  onToggleHidden,
  onDelete,
}: CategoryCardProps) {
  const sorted = [...items].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order,
  );

  function handleDelete() {
    if (items.length > 0) {
      window.alert(
        `"${category.title}" kategorisinde ${items.length} ürün var. Önce ürünleri silin ya da başka kategoriye taşıyın.`,
      );
      return;
    }
    if (window.confirm(`"${category.title}" kategorisi silinsin mi?`)) onDelete();
  }

  return (
    <section className={styles.category} aria-labelledby={`cat-${category.id}`}>
      <div className={styles.categoryHead}>
        <h3 className={styles.categoryTitle} id={`cat-${category.id}`}>
          {category.title}{' '}
          <span className={styles.categoryCount}>({items.length})</span>
        </h3>
        <button
          type="button"
          className={styles.btnDanger}
          onClick={handleDelete}
          disabled={disabled}
          aria-label={`${category.title} kategorisini sil`}
          title="Kategoriyi sil"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.card}>
        {sorted.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            disabled={disabled}
            onEdit={() => onEdit(item)}
            onToggleHidden={() => onToggleHidden(item)}
          />
        ))}
        <button
          type="button"
          className={styles.addRow}
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus size={16} aria-hidden="true" />
          Ürün ekle
        </button>
      </div>
    </section>
  );
}
