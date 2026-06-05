"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  }

  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [items]);

  if (!authed) {
    return (
      <main style={styles.authWrap}>
        <form onSubmit={handleLogin} style={styles.authCard}>
          <h1 style={styles.authTitle}>Yönetim Paneli</h1>
          <label htmlFor="admin-password" style={styles.label}>
            Şifre
          </label>
          <input
            id="admin-password"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={styles.input}
            autoComplete="current-password"
          />
          {authError && (
            <p style={styles.errorText}>Şifre hatalı. Tekrar deneyin.</p>
          )}
          <button type="submit" style={styles.primaryBtn}>
            Giriş
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Menü Yönetimi</h1>
        <button
          type="button"
          onClick={() => void fetchItems()}
          style={styles.secondaryBtn}
        >
          Yenile
        </button>
      </header>

      {error && <p style={styles.errorBanner}>{error}</p>}

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Yeni Tabak Ekle</h2>
        <form onSubmit={addItem} style={styles.addForm}>
          <input
            list="kategori-list"
            placeholder="Kategori"
            value={newItem.category}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, category: e.target.value }))
            }
            style={styles.input}
            aria-label="Kategori"
          />
          <datalist id="kategori-list">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          <input
            placeholder="İsim"
            value={newItem.name}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, name: e.target.value }))
            }
            style={styles.input}
            aria-label="İsim"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Fiyat"
            value={newItem.price}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, price: e.target.value }))
            }
            style={styles.input}
            aria-label="Fiyat"
          />
          <button type="submit" style={styles.primaryBtn} disabled={adding}>
            {adding ? "Ekleniyor…" : "Ekle"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        {loading ? (
          <p style={styles.muted}>Yükleniyor…</p>
        ) : items.length === 0 ? (
          <p style={styles.muted}>Kayıt bulunamadı.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>İsim</th>
                  <th style={styles.th}>Fiyat</th>
                  <th style={styles.th}>Aktif</th>
                  <th style={styles.th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    style={item.is_active ? undefined : styles.inactiveRow}
                  >
                    <td style={styles.td}>{item.category}</td>
                    <td style={styles.td}>
                      <input
                        value={item.name}
                        onChange={(e) =>
                          updateField(item.id, "name", e.target.value)
                        }
                        style={styles.cellInput}
                        aria-label={`${item.name} ismi`}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          updateField(
                            item.id,
                            "price",
                            Number(e.target.value),
                          )
                        }
                        style={{ ...styles.cellInput, width: 90 }}
                        aria-label={`${item.name} fiyatı`}
                      />
                    </td>
                    <td style={styles.td}>
                      <label style={styles.toggleLabel}>
                        <input
                          type="checkbox"
                          checked={item.is_active}
                          onChange={() => void toggleActive(item)}
                          aria-label={`${item.name} aktiflik durumu`}
                        />
                        <span>{item.is_active ? "Aktif" : "Pasif"}</span>
                      </label>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          type="button"
                          onClick={() => void saveItem(item)}
                          style={styles.primaryBtn}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? "…" : "Kaydet"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void softDelete(item)}
                          style={styles.dangerBtn}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  authWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: 16,
  },
  authCard: {
    width: "100%",
    maxWidth: 320,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid #dddddd",
    borderRadius: 8,
    padding: 24,
  },
  authTitle: { fontSize: 20, margin: 0, fontWeight: 700 },
  page: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: 16,
    maxWidth: 960,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  title: { fontSize: 22, margin: 0, fontWeight: 700 },
  sectionTitle: { fontSize: 16, margin: "0 0 12px", fontWeight: 700 },
  card: {
    border: "1px solid #dddddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  label: { fontSize: 13, fontWeight: 600 },
  input: {
    flex: "1 1 140px",
    minWidth: 0,
    padding: "8px 10px",
    border: "1px solid #cccccc",
    borderRadius: 6,
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
  },
  cellInput: {
    width: "100%",
    minWidth: 120,
    padding: "6px 8px",
    border: "1px solid #cccccc",
    borderRadius: 6,
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
  },
  tableWrap: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: "2px solid #111111",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #eeeeee",
    verticalAlign: "middle",
  },
  inactiveRow: { opacity: 0.5 },
  toggleLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  actions: { display: "flex", gap: 6 },
  primaryBtn: {
    padding: "8px 14px",
    border: "1px solid #111111",
    borderRadius: 6,
    backgroundColor: "#111111",
    color: "#ffffff",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    padding: "8px 14px",
    border: "1px solid #111111",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  dangerBtn: {
    padding: "8px 14px",
    border: "1px solid #b00020",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    color: "#b00020",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  muted: { color: "#666666", margin: 0 },
  errorText: { color: "#b00020", fontSize: 13, margin: 0 },
  errorBanner: {
    color: "#b00020",
    backgroundColor: "#fdecef",
    border: "1px solid #f5c2cb",
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    marginBottom: 16,
  },
};
