"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
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
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Image src="/logo-icon.png" alt="RoboZed" width={90} height={58} style={{ margin: "0 auto 12px", display: "block", objectFit: "contain" }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.5px" }}>Admin Panel</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              className="input"
              autoComplete="email"
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: "#FEE2E2",
                borderRadius: 8,
                color: "var(--error)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
          Need admin access?{" "}
          <Link href="/admin/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Request access
          </Link>
        </p>

        <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20, textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--text-light)", textDecoration: "none" }}>
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
