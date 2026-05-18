"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Field({
  label, name, type = "text", placeholder, required = false, as,
  value, onChange, error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  as?: "textarea";
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "var(--error)" }}>*</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input"
          style={{ resize: "vertical", borderColor: error ? "var(--error)" : undefined }}
        />
      ) : (
        <input
          id={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input"
          style={{ borderColor: error ? "var(--error)" : undefined }}
        />
      )}
      {error && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total: cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [discountInput, setDiscountInput] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);

  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const finalTotal = cartTotal - discountAmount;

  if (items.length === 0) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 18, color: "var(--text-muted)", marginBottom: 24 }}>Your cart is empty.</p>
        <Link href="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  async function applyDiscount() {
    if (!discountInput.trim()) return;
    setDiscountLoading(true);
    setDiscountError("");
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountInput }),
      });
      const data = await res.json();
      if (!res.ok) { setDiscountError(data.error); return; }
      setDiscountCode(data.code);
      setDiscountPercent(data.percent);
    } finally {
      setDiscountLoading(false);
    }
  }

  function removeDiscount() {
    setDiscountCode("");
    setDiscountPercent(0);
    setDiscountInput("");
    setDiscountError("");
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone.trim())) errs.phone = "Enter a valid phone number";
    if (!form.address.trim()) errs.address = "Address is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          subtotal: cartTotal,
          discountCode,
          discountPercent,
          total: finalTotal,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to place order"); }
      const data = await res.json();
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div style={{ padding: "60px 0 96px" }}>
      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Almost there</p>
          <h1 className="section-title">Checkout</h1>
        </div>

        <div className="checkout-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 40, alignItems: "start" }}>
          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>Delivery Information</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Field label="Full Name" name="fullName" placeholder="e.g. Faizur Rahman" required
                  value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} error={fieldErrors.fullName} />
                <Field label="Phone Number" name="phone" type="tel" placeholder="e.g. +880 1700 000000" required
                  value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={fieldErrors.phone} />
                <Field label="Delivery Address" name="address" as="textarea" placeholder="House, Road, Area, City" required
                  value={form.address} onChange={(v) => setForm({ ...form, address: v })} error={fieldErrors.address} />
                <Field label="Email Address" name="email" type="email" placeholder="optional — for receipt"
                  value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={fieldErrors.email} />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#FEE2E2", borderRadius: 10, color: "var(--error)", fontSize: 14 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: "100%", marginTop: 20, padding: "15px", fontSize: 16, justifyContent: "center" }}>
              {loading ? "Placing order…" : `Place Order · ৳${finalTotal.toLocaleString()}`}
            </button>
          </form>

          {/* Order summary */}
          <div className="card checkout-summary" style={{ padding: 28, position: "sticky", top: 88 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>Order Summary</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {items.map((item) => (
                <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--text-muted)" }}>
                    {item.name}<span style={{ marginLeft: 4, fontWeight: 600, color: "var(--text-light)" }}>×{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Discount code input */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
              {discountCode ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#D1FAE5", borderRadius: 10 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>🏷 {discountCode}</span>
                    <span style={{ fontSize: 12, color: "#065F46", marginLeft: 8 }}>−{discountPercent}% off</span>
                  </div>
                  <button onClick={removeDiscount} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#065F46", lineHeight: 1 }}>×</button>
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Discount Code
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={discountInput}
                      onChange={(e) => { setDiscountInput(e.target.value.toUpperCase()); setDiscountError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyDiscount())}
                      placeholder="Enter code"
                      className="input"
                      style={{ fontSize: 13, flex: 1 }}
                    />
                    <button type="button" onClick={applyDiscount} disabled={discountLoading || !discountInput.trim()} className="btn-outline"
                      style={{ fontSize: 13, padding: "0 16px", whiteSpace: "nowrap" }}>
                      {discountLoading ? "…" : "Apply"}
                    </button>
                  </div>
                  {discountError && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 6 }}>{discountError}</p>}
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>৳{cartTotal.toLocaleString()}</span>
              </div>
              {discountPercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#059669" }}>Discount ({discountPercent}%)</span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>−৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--accent)", borderRadius: 10, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              A PDF receipt will be generated and emailed to the admin after your order is placed.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-layout  { grid-template-columns: 1fr !important; }
          .checkout-summary { position: static !important; }
        }
      `}</style>
    </div>
  );
}
