"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdminRegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, var(--primary-darker) 0%, var(--primary) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          className="animate-scale-in"
          style={{ background: "#fff", borderRadius: 20, padding: "40px 36px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 32px 80px rgba(1,38,64,0.3)" }}
        >
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Request Submitted</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
            Your admin access request has been sent. The store owner will review and approve it. You&apos;ll be notified once approved.
          </p>
          <Link href="/admin" className="btn-primary" style={{ display: "inline-block" }}>Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, var(--primary-darker) 0%, var(--primary) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 32px 80px rgba(1,38,64,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Image src="/logo-icon.png" alt="RoboZed" width={90} height={58} style={{ margin: "0 auto 12px", display: "block", objectFit: "contain" }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.5px" }}>Request Access</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Submit a request for admin panel access</p>
        </div>

        <div style={{ background: "var(--accent)", borderRadius: 10, padding: "12px 14px", marginBottom: 24, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Your request will be reviewed by the store owner before access is granted.
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
            { label: "Email", key: "email", type: "email", placeholder: "your@email.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Choose a password" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="input"
                required
              />
            </div>
          ))}

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "#FEE2E2", borderRadius: 8, color: "var(--error)", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 8 }}
          >
            {status === "loading" ? "Submitting…" : "Submit Request"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
          Already have access?{" "}
          <Link href="/admin" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
