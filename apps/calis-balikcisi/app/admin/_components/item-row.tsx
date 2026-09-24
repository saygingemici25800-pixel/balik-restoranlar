'use client';

import type { ContentItem } from '@/lib/content/types';
import styles from '../admin.module.css';

type ItemRowProps = {
  item: ContentItem;
  disabled: boolean;
  onEdit: () => void;
  onToggleHidden: () => void;
};

function priceLabel(item: ContentItem): string {
  if (item.dailyPrice) return 'Günlük fiyat';
  if (item.price === null) return 'Fiyat yok';
  return `${item.price} ₺${item.unit === 'kg' ? ' / kg' : ''}`;
}

export function ItemRow({ item, disabled, onEdit, onToggleHidden }: ItemRowProps) {
  return (
    <div className={`${styles.row} ${item.hidden ? styles.rowInactive : ''}`}>
      <button
        type="button"
        className={styles.itemButton}
        onClick={onEdit}
        disabled={disabled}
        aria-label={`${item.name.tr} düzenle`}
      >
        <span className={styles.itemName}>
          {item.name.tr}
          {item.featured ? <span className={styles.badge}>Öne çıkan</span> : null}
        </span>
        <span className={styles.itemMeta}>{priceLabel(item)}</span>
      </button>
      <label className={styles.switch} title={item.hidden ? 'Gizli' : 'Görünür'}>
        <input
          className={styles.switchInput}
          type="checkbox"
          checked={!item.hidden}
          onChange={onToggleHidden}
          disabled={disabled}
          aria-label={`${item.name.tr} sitede görünsün`}
        />
        <span className={styles.slider} />
      </label>
    </div>
  );
}
