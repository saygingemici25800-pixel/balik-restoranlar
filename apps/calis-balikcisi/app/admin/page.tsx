"use client";

export const dynamic = "force-dynamic";

import {
  AlertCircle,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";

// Basit koruma — production auth değil. Şifre client-side karşılaştırılır.
// ADMIN_PASSWORD env değişkeni sunucu tarafı olduğundan tarayıcıya ulaşmaz;
// bu yüzden değer burada sabit tutulur (brief: "basit koruma yeterli").
const ADMIN_PASSWORD = "calis2026";

type MenuItem = {
  id: number;
  category: string;
  name: string;
  price: number;
  is_active: boolean;
};

type NewItem = {
  category: string;
  name: string;
  price: string;
};

const EMPTY_NEW_ITEM: NewItem = { category: "", name: "", price: "" };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>(EMPTY_NEW_ITEM);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!authed) return;
    void fetchItems();
  }, [authed]);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("menu_items")
      .select("id, category, name, price, is_active")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (fetchError) {
      setError("Menü yüklenemedi: " + fetchError.message);
      setLoading(false);
      return;
    }
    setItems((data ?? []) as MenuItem[]);
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  function handleLogout() {
    setAuthed(false);
    setPasswordInput("");
    setItems([]);
  }

  function updateField<K extends keyof MenuItem>(
    id: number,
    key: K,
    value: MenuItem[K],
  ) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  }

  async function saveItem(item: MenuItem) {
    setSavingId(item.id);
    setError(null);
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({ name: item.name, price: item.price })
      .eq("id", item.id);

    if (updateError) {
      setError("Kaydedilemedi: " + updateError.message);
    }
    setSavingId(null);
  }

  async function toggleActive(item: MenuItem) {
    const nextValue = !item.is_active;
    updateField(item.id, "is_active", nextValue);
    setError(null);
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({ is_active: nextValue })
      .eq("id", item.id);

    if (updateError) {
      setError("Durum güncellenemedi: " + updateError.message);
      updateField(item.id, "is_active", item.is_active);
    }
  }

  async function softDelete(item: MenuItem) {
    if (!window.confirm(`"${item.name}" pasife alınsın mı?`)) return;
    updateField(item.id, "is_active", false);
    setError(null);
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({ is_active: false })
      .eq("id", item.id);

    if (updateError) {
      setError("Silinemedi: " + updateError.message);
      updateField(item.id, "is_active", item.is_active);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = newItem.name.trim();
    const trimmedCategory = newItem.category.trim();
    const parsedPrice = Number(newItem.price);

    if (!trimmedCategory || !trimmedName || Number.isNaN(parsedPrice)) {
      setError("Yeni tabak için kategori, isim ve geçerli fiyat gerekli.");
      return;
    }

    setAdding(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("menu_items")
      .insert({
        category: trimmedCategory,
        name: trimmedName,
        price: parsedPrice,
        is_active: true,
      })
      .select("id, category, name, price, is_active")
      .single();

    if (insertError) {
      setError("Eklenemedi: " + insertError.message);
      setAdding(false);
      return;
    }
    if (data) {
      setItems((prev) => [...prev, data as MenuItem]);
    }
    setNewItem(EMPTY_NEW_ITEM);
    setAdding(false);
    setModalOpen(false);
  }

  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const list = map.get(item.category);
      if (list) {
        list.push(item);
      } else {
        map.set(item.category, [item]);
      }
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "tr"),
    );
  }, [items]);

  if (!authed) {
    return (
      <div className={styles.wrap}>
        <main className={styles.authWrap}>
          <form className={styles.authCard} onSubmit={handleLogin}>
            <h1 className={styles.authTitle}>Çalış Balıkçısı</h1>
            <p className={styles.authSub}>Menü Yönetimi — giriş yapın</p>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="admin-password">
                Şifre
              </label>
              <input
                id="admin-password"
                className={styles.input}
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
            </div>
            {authError && (
              <p className={styles.authError}>Şifre hatalı. Tekrar deneyin.</p>
            )}
            <button
              type="submit"
              className={`${styles.btnPrimary} ${styles.authBtn}`}
            >
              Giriş yap
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.brand}>
            Çalış Balıkçısı <span className={styles.brandMuted}>— Menü Yönetimi</span>
          </h1>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={handleLogout}
          >
            <LogOut size={16} aria-hidden="true" />
            Çıkış
          </button>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.toolbar}>
          <h2 className={styles.toolbarTitle}>Tabaklar</h2>
          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => void fetchItems()}
              aria-label="Listeyi yenile"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Yenile
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => {
                setNewItem(EMPTY_NEW_ITEM);
                setModalOpen(true);
              }}
            >
              <Plus size={16} aria-hidden="true" />
              Yeni Tabak Ekle
            </button>
          </div>
        </div>

        {error && (
          <p className={styles.errorBanner}>
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        {loading ? (
          <p className={styles.muted}>Yükleniyor…</p>
        ) : items.length === 0 ? (
          <p className={styles.muted}>Henüz tabak yok. Yeni bir tane ekleyin.</p>
        ) : (
          grouped.map(([category, list]) => (
            <section className={styles.category} key={category}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.card}>
                {list.map((item) => (
                  <div
                    className={`${styles.row} ${
                      item.is_active ? "" : styles.rowInactive
                    }`}
                    key={item.id}
                  >
                    <input
                      className={`${styles.input} ${styles.nameInput}`}
                      value={item.name}
                      onChange={(e) =>
                        updateField(item.id, "name", e.target.value)
                      }
                      aria-label={`${item.name} ismi`}
                    />
                    <div className={styles.priceWrap}>
                      <input
                        className={`${styles.input} ${styles.priceInput}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          updateField(item.id, "price", Number(e.target.value))
                        }
                        aria-label={`${item.name} fiyatı`}
                      />
                    </div>
                    <label
                      className={styles.switch}
                      title={item.is_active ? "Aktif" : "Pasif"}
                    >
                      <input
                        className={styles.switchInput}
                        type="checkbox"
                        checked={item.is_active}
                        onChange={() => void toggleActive(item)}
                        aria-label={`${item.name} aktiflik durumu`}
                      />
                      <span className={styles.slider} />
                    </label>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={`${styles.btnPrimary} ${styles.saveBtn}`}
                        onClick={() => void saveItem(item)}
                        disabled={savingId === item.id}
                      >
                        {savingId === item.id ? "…" : "Kaydet"}
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => void softDelete(item)}
                        aria-label={`${item.name} sil`}
                        title="Sil (pasife al)"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {modalOpen && (
        <div
          className={styles.overlay}
          onClick={() => !adding && setModalOpen(false)}
          role="presentation"
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle} id="add-title">
              Yeni Tabak Ekle
            </h2>
            <p className={styles.modalSub}>
              Kategori, isim ve fiyat girin. Tabak varsayılan olarak aktif eklenir.
            </p>
            <form onSubmit={addItem}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="new-category">
                  Kategori
                </label>
                <input
                  id="new-category"
                  className={styles.input}
                  list="kategori-list"
                  placeholder="Örn. Mezeler"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, category: e.target.value }))
                  }
                  autoFocus
                />
                <datalist id="kategori-list">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="new-name">
                  İsim
                </label>
                <input
                  id="new-name"
                  className={styles.input}
                  placeholder="Örn. Levrek ızgara"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="new-price">
                  Fiyat (₺)
                </label>
                <input
                  id="new-price"
                  className={styles.input}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setModalOpen(false)}
                  disabled={adding}
                >
                  <X size={16} aria-hidden="true" />
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={adding}
                >
                  {adding ? "Ekleniyor…" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
