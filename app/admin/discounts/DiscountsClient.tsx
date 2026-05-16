"use client";

import { useState } from "react";

type Discount = { _id: string; code: string; percent: number; active: boolean; createdAt: string };

export default function DiscountsClient({ discounts: initial }: { discounts: Discount[] }) {
  const [discounts, setDiscounts] = useState(initial);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const p = Number(percent);
    if (!code.trim()) { setFormError("Code is required"); return; }
    if (!p || p < 1 || p > 100) { setFormError("Percent must be 1–100"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, percent: p }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }
      setDiscounts([data, ...discounts]);
      setCode("");
      setPercent("");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) {
      setDiscounts(discounts.map((d) => (d._id === id ? { ...d, active } : d)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this discount code?")) return;
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    setDiscounts(discounts.filter((d) => d._id !== id));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 32, alignItems: "start" }}>
      {/* Create form */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>New Discount Code</h2>
        <form onSubmit={create}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                Code <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="input"
                style={{ fontSize: 14, letterSpacing: "1px", fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                Discount % <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  placeholder="e.g. 15"
                  className="input"
                  style={{ paddingRight: 40 }}
                />
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--text-muted)" }}>%</span>
              </div>
            </div>
            {formError && <p style={{ fontSize: 13, color: "var(--error)" }}>{formError}</p>}
            <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: "center" }}>
              {saving ? "Creating…" : "Create Code"}
            </button>
          </div>
        </form>
      </div>

      {/* Codes list */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--accent)" }}>
              {["Code", "Discount", "Status", "Created", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-light)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "60px 16px", textAlign: "center", color: "var(--text-light)" }}>
                  No discount codes yet. Create one to get started.
                </td>
              </tr>
            ) : (
              discounts.map((d) => (
                <tr key={d._id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "var(--primary)", background: "var(--accent)", padding: "3px 10px", borderRadius: 6 }}>
                      {d.code}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    {d.percent}% off
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => toggle(d._id, !d.active)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: d.active ? "#D1FAE5" : "#FEE2E2",
                        color: d.active ? "#065F46" : "#991B1B",
                      }}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-light)" }}>
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={() => remove(d._id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontSize: 13, fontWeight: 600 }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`@media (max-width: 900px) { .card { grid-column: 1 / -1 !important; } }`}</style>
    </div>
  );
}
