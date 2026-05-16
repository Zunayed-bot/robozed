"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [copied, setCopied] = useState(false);

  function copyOrderId() {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ padding: "80px 24px 96px", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Check icon */}
        <div
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 4px 20px rgba(1,136,199,0.15)",
          }}
        >
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 10 }}>
          Order Confirmed!
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
          Thank you for your order. Our team will process it shortly and contact you to confirm delivery.
        </p>

        {/* Order ID box */}
        {orderId && (
          <div style={{
            background: "var(--accent)", border: "2px solid var(--primary)",
            borderRadius: 16, padding: "24px 28px", marginBottom: 32, textAlign: "left",
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>
              Your Order ID — Save this for tracking
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{
                flex: 1, fontFamily: "monospace", fontSize: 26, fontWeight: 800,
                letterSpacing: "3px", color: "var(--primary)",
              }}>
                #{orderId}
              </span>
              <button
                onClick={copyOrderId}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", background: copied ? "#D1FAE5" : "#fff",
                  border: `1.5px solid ${copied ? "#059669" : "var(--primary)"}`,
                  borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  color: copied ? "#065F46" : "var(--primary)", transition: "all 0.2s",
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
              Use this ID to track your order status anytime at{" "}
              <Link href={`/track-order?orderId=${orderId}`} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                Track Order
              </Link>
              .
            </p>
          </div>
        )}

        {/* Info box */}
        <div style={{
          background: "#F8FAFC", borderRadius: 14, padding: "18px 22px", marginBottom: 36, textAlign: "left",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "A PDF receipt has been generated and sent to the admin team.",
              "We will contact you on your provided phone number to confirm delivery.",
            ].map((text) => (
              <div key={text} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {orderId && (
            <Link
              href={`/track-order?orderId=${orderId}`}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              Track Order
            </Link>
          )}
          <Link href="/products" className="btn-outline">Continue Shopping</Link>
          <Link href="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: "center" }}>Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
