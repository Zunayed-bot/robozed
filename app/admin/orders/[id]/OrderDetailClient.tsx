"use client";

import { useState } from "react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  customer: { fullName: string; phone: string; address: string; email?: string };
  items: OrderItem[];
  subtotal?: number;
  discountCode?: string;
  discountPercent?: number;
  total: number;
  status: string;
  createdAt: string;
}

export default function OrderDetailClient({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Infer discount from items sum if discountPercent wasn't saved (schema cache bug)
  const itemsTotal  = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const subtotal    = order.subtotal ?? itemsTotal;
  const inferredAmt = Math.max(0, subtotal - order.total);
  const hasDiscount = (order.discountPercent ?? 0) > 0 || inferredAmt > 0;
  const discountAmt = (order.discountPercent ?? 0) > 0
    ? Math.round(subtotal * ((order.discountPercent ?? 0) / 100))
    : inferredAmt;

  async function handleStatusChange(newStatus: string) {
    setSaving(true);
    try {
      await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    } finally {
      setSaving(false);
    }
  }

  async function downloadPDF() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/pdf`);
      if (!res.ok) {
        const text = await res.text();
        alert(`PDF error ${res.status}: ${text}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${order.orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`PDF download failed: ${e}`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 28, display: "flex", gap: 8, fontSize: 13, color: "var(--text-light)", alignItems: "center" }}>
        <Link href="/admin/dashboard" style={{ color: "var(--text-light)", textDecoration: "none" }}>Dashboard</Link>
        <span>/</span>
        <Link href="/admin/orders" style={{ color: "var(--text-light)", textDecoration: "none" }}>Orders</Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>#{order.orderId}</span>
      </nav>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Order #{order.orderId}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Placed on {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={saving}
            className="input"
            style={{ width: "auto", paddingRight: 36, fontSize: 13 }}
          >
            {["pending", "processing", "delivered", "cancelled"].map((s) => (
              <option key={s} value={s} style={{ textTransform: "capitalize" }}>{s}</option>
            ))}
          </select>
          <button onClick={downloadPDF} disabled={downloading} className="btn-primary" style={{ fontSize: 13 }}>
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        {/* Items + billing */}
        <div>
          <div className="card" style={{ overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                Items ({order.items.length})
              </h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--accent)" }}>
                  {["Product", "Unit Price", "Qty", "Amount"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-light)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.productId} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{item.name}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>৳{item.price.toLocaleString()}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>{item.quantity}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {/* Subtotal + Discount — only when a discount was applied */}
                {hasDiscount && (
                  <>
                    <tr style={{ borderTop: "2px solid var(--border)" }}>
                      <td colSpan={3} style={{ padding: "12px 16px", fontSize: 13, textAlign: "right", color: "var(--text-muted)" }}>
                        Subtotal
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                        ৳{subtotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ background: "#F0FDF4" }}>
                      <td colSpan={3} style={{ padding: "10px 16px", fontSize: 13, textAlign: "right", color: "#059669" }}>
                        Discount
                        {order.discountCode && (
                          <>&nbsp;<span style={{ fontFamily: "monospace", fontWeight: 700, background: "#D1FAE5", padding: "2px 8px", borderRadius: 4 }}>
                            {order.discountCode}
                          </span></>
                        )}
                        {(order.discountPercent ?? 0) > 0 && <>&nbsp;({order.discountPercent}%)</>}
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "#059669" }}>
                        −৳{discountAmt.toLocaleString()}
                      </td>
                    </tr>
                  </>
                )}

                {/* Final total */}
                <tr style={{ background: "var(--accent)" }}>
                  <td colSpan={3} style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, textAlign: "right", color: "var(--text)" }}>
                    Total
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>
                    ৳{order.total.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`badge badge-${status}`}>{status}</span>
            {saving && <span style={{ fontSize: 12, color: "var(--text-light)" }}>Saving…</span>}
          </div>
        </div>

        {/* Customer + Actions */}
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 16 }}>
              Customer
            </h2>
            {[
              { label: "Name",    value: order.customer.fullName },
              { label: "Phone",   value: order.customer.phone },
              { label: "Address", value: order.customer.address },
              ...(order.customer.email ? [{ label: "Email", value: order.customer.email }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, color: "var(--text)" }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 12 }}>
              Actions
            </h2>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="btn-outline"
              style={{ width: "100%", justifyContent: "center", fontSize: 13 }}
            >
              {downloading ? "Generating…" : "Download PDF Receipt"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
