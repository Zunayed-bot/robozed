"use client";

import { useState } from "react";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  description: string;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  category: "",
  images: "",
  stock: "100",
  featured: false,
  specs: "",
};

export default function ProductManagerClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      category: p.category,
      images: p.images.join(", "),
      stock: String(p.stock),
      featured: p.featured,
      specs: "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: form.description,
        price: Number(form.price),
        category: form.category,
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
        stock: Number(form.stock),
        featured: form.featured,
        specs: {},
      };

      const url = editing ? `/api/products/${editing._id}` : "/api/products";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save");
      }
      const saved = await res.json();

      if (editing) {
        setProducts((prev) => prev.map((p) => (p._id === editing._id ? saved : p)));
      } else {
        setProducts((prev) => [saved, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Product</button>
      </div>

      {/* Product table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--accent)" }}>
              {["Image", "Name", "Category", "Price", "Stock", "Featured", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-light)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "60px 16px", textAlign: "center", color: "var(--text-light)" }}>
                  No products yet. Click "+ Add Product" to get started.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {p.images[0] ? (
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", position: "relative", background: "var(--accent)" }}>
                        <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "cover" }} sizes="48px" />
                      </div>
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: "var(--accent)" }} />
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{p.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)", textTransform: "capitalize" }}>{p.category}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>৳{p.price.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{p.stock}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>
                    {p.featured ? (
                      <span style={{ color: "var(--success)", fontWeight: 600 }}>✓</span>
                    ) : (
                      <span style={{ color: "var(--text-light)" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(p)} className="btn-ghost" style={{ padding: "4px 12px", fontSize: 12 }}>Edit</button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deleting === p._id}
                        style={{ padding: "4px 12px", fontSize: 12, borderRadius: 6, border: "none", background: "#FEE2E2", color: "var(--error)", cursor: "pointer" }}
                      >
                        {deleting === p._id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div
            className="animate-scale-in"
            style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-light)", lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Product Name *", key: "name", placeholder: "e.g. Arduino Mega 2560" },
                  { label: "Slug", key: "slug", placeholder: "auto-generated if empty" },
                  { label: "Category *", key: "category", placeholder: "e.g. microchips" },
                  { label: "Price (BDT) *", key: "price", placeholder: "e.g. 1200", type: "number" },
                  { label: "Stock", key: "stock", placeholder: "100", type: "number" },
                  { label: "Image URLs (comma-separated)", key: "images", placeholder: "https://..." },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{label}</label>
                    <input
                      type={type ?? "text"}
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="input"
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Product description…"
                    rows={3}
                    className="input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
                  />
                  <span style={{ fontSize: 14, color: "var(--text)" }}>Featured product</span>
                </label>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: "10px 14px", background: "#FEE2E2", borderRadius: 8, color: "var(--error)", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  {saving ? "Saving…" : editing ? "Update Product" : "Add Product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
