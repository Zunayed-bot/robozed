"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, itemCount, total, removeItem, updateQty } = useCart();

  if (itemCount === 0) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Your cart is empty</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Add some products to get started.</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "60px 0 96px" }}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 8 }}>Your Cart</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 48, fontSize: 14 }}>
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>

        <div className="cart-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {items.map((item) => (
              <div
                key={item.productId}
                className="card animate-fade-up cart-item"
                style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 20, padding: 20, alignItems: "center" }}
              >
                {/* Image */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    overflow: "hidden",
                    position: "relative",
                    background: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "var(--accent)" }} />
                  )}
                </div>

                {/* Details */}
                <div>
                  <Link
                    href={`/products/${item.slug}`}
                    style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", textDecoration: "none", marginBottom: 4, display: "block" }}
                  >
                    {item.name}
                  </Link>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginBottom: 12 }}>
                    ৳{item.price.toLocaleString()}
                  </div>
                  {/* Qty */}
                  <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid var(--border)", borderRadius: 8, width: "fit-content" }}>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "var(--text-muted)" }}
                    >
                      −
                    </button>
                    <span style={{ width: 32, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "var(--text-muted)" }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal + remove */}
                <div className="cart-item-right" style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "var(--text-light)",
                      transition: "color 0.2s",
                    }}
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card animate-fade-up delay-100 cart-summary" style={{ padding: 28, position: "sticky", top: 88 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>Order Summary</h2>

            {items.map((item) => (
              <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "var(--text-muted)" }}>
                <span>{item.name} × {item.quantity}</span>
                <span>৳{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>৳{total.toLocaleString()}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary" style={{ width: "100%", textAlign: "center", display: "block", marginTop: 20 }}>
              Proceed to Checkout
            </Link>
            <Link href="/products" className="btn-ghost" style={{ width: "100%", textAlign: "center", display: "block", marginTop: 10 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
          .cart-summary { position: static !important; }
        }
        @media (max-width: 480px) {
          .cart-item { grid-template-columns: 64px 1fr !important; gap: 12px !important; }
          .cart-item-right { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; text-align: left !important; }
        }
      `}</style>
    </div>
  );
}
