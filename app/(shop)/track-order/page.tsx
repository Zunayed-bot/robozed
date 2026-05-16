"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface TrackedOrder {
  orderId: string;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number; image: string }[];
  subtotal: number;
  discountCode: string;
  discountPercent: number;
  total: number;
  customerName: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  pending:    { label: "Pending",    color: "#92400E", bg: "#FEF3C7", step: 1 },
  processing: { label: "Processing", color: "#1E40AF", bg: "#DBEAFE", step: 2 },
  delivered:  { label: "Delivered",  color: "#065F46", bg: "#D1FAE5", step: 3 },
  cancelled:  { label: "Cancelled",  color: "#991B1B", bg: "#FEE2E2", step: 0 },
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("orderId") ?? "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("orderId");
    if (id) {
      setQuery(id);
      fetchOrder(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrder(id: string) {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(id.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setOrder(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    fetchOrder(query);
  }

  const cfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending) : null;
  const itemsTotal  = order ? order.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;
  const subtotal    = order ? (order.subtotal ?? itemsTotal) : 0;
  const inferredAmt = order ? Math.max(0, subtotal - order.total) : 0;
  const hasDiscount = (order?.discountPercent ?? 0) > 0 || inferredAmt > 0;
  const discountAmt = order
    ? ((order.discountPercent ?? 0) > 0
      ? Math.round(subtotal * ((order.discountPercent ?? 0) / 100))
      : inferredAmt)
    : 0;

  const steps = [
    { label: "Order Placed", step: 1 },
    { label: "Processing",   step: 2 },
    { label: "Delivered",    step: 3 },
  ];

  return (
    <div style={{ padding: "60px 0 96px" }}>
      <div className="container" style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Real-time updates</p>
          <h1 className="section-title">Track Your Order</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 15 }}>
            Enter your order ID to check the current status
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder="Enter your Order ID (e.g. A1B2C3DE)"
              className="input"
              style={{ flex: 1, fontFamily: "monospace", fontSize: 15, letterSpacing: "1px" }}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary"
              style={{ whiteSpace: "nowrap", padding: "0 28px" }}
            >
              {loading ? "Searching…" : "Track Order"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            padding: "16px 20px", background: "#FEE2E2", borderRadius: 12,
            color: "#991B1B", fontSize: 14, marginBottom: 24,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
            </svg>
            {error}
          </div>
        )}

        {/* Order result */}
        {order && cfg && (
          <div>
            {/* Status header */}
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
                    Order ID
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: "var(--primary)", letterSpacing: "2px" }}>
                    #{order.orderId}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString("en-US", { timeStyle: "short" })}
                  </p>
                </div>
                <span style={{
                  padding: "8px 20px", borderRadius: 20, fontSize: 14, fontWeight: 700,
                  color: cfg.color, background: cfg.bg,
                }}>
                  {cfg.label}
                </span>
              </div>

              {/* Progress steps — not shown for cancelled */}
              {order.status !== "cancelled" && (
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  {steps.map((s, i) => {
                    const done = cfg.step >= s.step;
                    const active = cfg.step === s.step;
                    return (
                      <div key={s.step} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: done ? "var(--primary)" : "var(--accent)",
                            border: active ? "3px solid var(--primary)" : "2px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.3s",
                          }}>
                            {done ? (
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            ) : (
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-light)" }} />
                            )}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: done ? 700 : 400, color: done ? "var(--primary)" : "var(--text-light)", whiteSpace: "nowrap" }}>
                            {s.label}
                          </span>
                        </div>
                        {i < steps.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: cfg.step > s.step ? "var(--primary)" : "var(--border)", margin: "0 8px", marginBottom: 22, transition: "all 0.3s" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {order.status === "cancelled" && (
                <div style={{ padding: "12px 16px", background: "#FEE2E2", borderRadius: 10, fontSize: 14, color: "#991B1B" }}>
                  This order has been cancelled.
                </div>
              )}
            </div>

            {/* Order for — quick personalization */}
            <div style={{ marginBottom: 8, padding: "12px 20px", background: "var(--accent)", borderRadius: 10, fontSize: 14, color: "var(--text-muted)" }}>
              Order for <strong style={{ color: "var(--text)" }}>{order.customerName}</strong>
            </div>

            {/* Items table */}
            <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  Items ({order.items.length})
                </h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--accent)" }}>
                    {["Product", "Qty", "Amount"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-light)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", fontSize: 14, color: "var(--text)" }}>{item.name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{item.quantity}</td>
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* Subtotal — only when discount exists */}
                  {hasDiscount && (
                    <tr style={{ borderTop: "2px solid var(--border)" }}>
                      <td colSpan={2} style={{ padding: "10px 16px", fontSize: 13, textAlign: "right", color: "var(--text-muted)" }}>Subtotal</td>
                      <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>৳{subtotal.toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Discount row */}
                  {hasDiscount && (
                    <tr style={{ background: "#F0FDF4" }}>
                      <td colSpan={2} style={{ padding: "10px 16px", fontSize: 13, textAlign: "right", color: "#059669" }}>
                        Discount&nbsp;
                        <span style={{ fontFamily: "monospace", fontWeight: 700, background: "#D1FAE5", padding: "2px 8px", borderRadius: 4 }}>
                          {order.discountCode}
                        </span>
                        &nbsp;({order.discountPercent}%)
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "#059669" }}>
                        −৳{discountAmt.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {/* Total */}
                  <tr style={{ background: "var(--accent)", borderTop: "2px solid var(--border)" }}>
                    <td colSpan={2} style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, textAlign: "right", color: "var(--text)" }}>Total</td>
                    <td style={{ padding: "14px 16px", fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>
                      ৳{order.total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/products" className="btn-primary">Continue Shopping</Link>
              <Link href="/" className="btn-outline">Back to Home</Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!order && !loading && !error && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-light)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <p style={{ fontSize: 15 }}>Enter your order ID above to see the status</p>
          </div>
        )}
      </div>
    </div>
  );
}
