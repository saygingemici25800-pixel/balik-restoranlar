'use client';

import type { Category } from '@/lib/content/types';
import styles from '../admin.module.css';
import type { ItemDraft } from './item-draft';

type ItemFieldsProps = {
  draft: ItemDraft;
  categories: Category[];
  onChange: <K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) => void;
};

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  dir?: 'rtl';
  placeholder?: string;
};

function TextField({ id, label, value, onChange, ...rest }: TextFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.checkRow}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function ItemFields({ draft, categories, onChange }: ItemFieldsProps) {
  return (
    <>
      <TextField id="item-name-tr" label="Ad (TR)" value={draft.nameTr} onChange={(v) => onChange('nameTr', v)} required />
      <div className={styles.fieldGrid}>
        <TextField id="item-name-en" label="Ad (EN) — opsiyonel" value={draft.nameEn} onChange={(v) => onChange('nameEn', v)} />
        <TextField id="item-name-ar" label="Ad (AR) — opsiyonel" value={draft.nameAr} onChange={(v) => onChange('nameAr', v)} dir="rtl" />
      </div>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="item-price">
            Fiyat (₺)
          </label>
          <input
            id="item-price"
            className={styles.input}
            inputMode="decimal"
            placeholder={draft.dailyPrice ? 'Boş bırakılabilir' : '0'}
            value={draft.price}
            onChange={(e) => onChange('price', e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="item-unit">
            Birim
          </label>
          <select
            id="item-unit"
            className={styles.input}
            value={draft.unit}
            onChange={(e) => onChange('unit', e.target.value === 'kg' ? 'kg' : 'portion')}
          >
            <option value="portion">Porsiyon</option>
            <option value="kg">Kg</option>
          </select>
        </div>
      </div>

      <div className={styles.checkGroup}>
        <Check label="Günlük fiyat (fiyat yerine “Günlük fiyat” yazar)" checked={draft.dailyPrice} onChange={(v) => onChange('dailyPrice', v)} />
        <Check label="Öne çıkar" checked={draft.featured} onChange={(v) => onChange('featured', v)} />
        <Check label="Gizle (sitede görünmez)" checked={draft.hidden} onChange={(v) => onChange('hidden', v)} />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="item-category">
          Kategori
        </label>
        <select id="item-category" className={styles.input} value={draft.categoryId} onChange={(e) => onChange('categoryId', e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <TextField id="item-image" label="Görsel URL — opsiyonel" value={draft.imageUrl} onChange={(v) => onChange('imageUrl', v)} placeholder="/menu/ornek.webp" />

      <details className={styles.details}>
        <summary>Açıklama</summary>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="item-desc">
            Kısa açıklama
          </label>
          <textarea id="item-desc" className={styles.input} rows={2} maxLength={300} value={draft.description} onChange={(e) => onChange('description', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="item-long-desc">
            Uzun açıklama
          </label>
          <textarea id="item-long-desc" className={styles.input} rows={4} maxLength={1000} value={draft.longDescription} onChange={(e) => onChange('longDescription', e.target.value)} />
        </div>
      </details>
    </>
  );
}
