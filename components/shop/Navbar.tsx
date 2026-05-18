"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(255,255,255,0.9)" : "#fff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        transition: "all 0.3s",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo-icon.png" alt="RoboZed" width={52} height={34} style={{ objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>
              RoboZed
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text-light)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Microchips · Robotics · Gadgets
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
          {[
            { href: "/", label: "Home" },
            { href: "/products", label: "Products" },
            { href: "/track-order", label: "Track Order" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-muted)",
                borderRadius: 8,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              className="nav-link"
            >
              {label}
            </Link>
          ))}

          {/* Cart */}
          <Link
            href="/cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: 8,
              padding: "9px 20px",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <CartIcon />
            Cart
            {itemCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  minWidth: 20,
                  height: 20,
                  background: "#EF4444",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  border: "2px solid #fff",
                }}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 10,
            margin: "-10px -4px",
            color: "var(--primary)",
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "#fff",
            padding: "16px 24px",
          }}
          className="mobile-menu"
        >
          {[
            { href: "/", label: "Home" },
            { href: "/products", label: "Products" },
            { href: "/track-order", label: "Track Order" },
            { href: "/cart", label: `Cart (${itemCount})` },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "14px 0",
                fontSize: 16,
                fontWeight: 500,
                color: "var(--text)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border)",
                minHeight: 48,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .nav-link:hover { background: var(--accent); color: var(--primary) !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}
