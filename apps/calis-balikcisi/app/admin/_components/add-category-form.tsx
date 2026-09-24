'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import styles from '../admin.module.css';

type AddCategoryFormProps = {
  disabled: boolean;
  onAdd: (title: string) => Promise<boolean>;
};

export function AddCategoryForm({ disabled, onAdd }: AddCategoryFormProps) {
  const [title, setTitle] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (await onAdd(title.trim())) setTitle('');
  }

  return (
    <form className={styles.addCategory} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="new-category">
        Yeni kategori
      </label>
      <div className={styles.inlineForm}>
        <input
          id="new-category"
          className={styles.input}
          placeholder="Örn. Kahvaltılıklar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
        <button type="submit" className={styles.btnPrimary} disabled={disabled || !title.trim()}>
          <Plus size={16} aria-hidden="true" />
          Ekle
        </button>
      </div>
    </form>
  );
}
