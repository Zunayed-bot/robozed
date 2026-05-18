"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/shop/ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  stock: number;
  specs: Record<string, string>;
}

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const images =
    product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"];

  function handleAdd() {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: images[0],
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div style={{ padding: "48px 0 96px" }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 32, fontSize: 13, color: "var(--text-light)" }}>
          <div className="desktop-only" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/" style={{ color: "var(--text-light)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/products" style={{ color: "var(--text-light)", textDecoration: "none" }}>Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} style={{ color: "var(--text-light)", textDecoration: "none", textTransform: "capitalize" }}>{product.category}</Link>
            <span>/</span>
            <span style={{ color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{product.name}</span>
          </div>
          <div className="mobile-only">
            <Link href="/products" style={{ color: "var(--text-light)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <span>←</span> Products
            </Link>
          </div>
        </nav>

        <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, marginBottom: 80 }}>
          {/* Images */}
          <div>
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "var(--accent)",
                aspectRatio: "1/1",
                position: "relative",
                marginBottom: 16,
              }}
            >
              <Image
                src={images[activeImg]}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      overflow: "hidden",
                      position: "relative",
                      border: i === activeImg ? "2px solid var(--primary)" : "2px solid var(--border)",
                      padding: 0,
                      cursor: "pointer",
                      background: "var(--accent)",
                    }}
                  >
                    <Image src={img} alt="" fill style={{ objectFit: "cover" }} sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="animate-fade-up">
            <span
              style={{
                display: "inline-block",
                background: "var(--accent)",
                color: "var(--primary)",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {product.category}
            </span>

            <h1
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              {product.name}
            </h1>

            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--primary)", marginBottom: 24 }}>
              ৳{product.price.toLocaleString()}
            </div>

            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 32 }}>
              {product.description}
            </p>

            {/* Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: product.stock > 0 ? "#22C55E" : "#EF4444",
                }}
              />
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}
              </span>
            </div>

            {/* Qty + Add */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: 40,
                    height: 48,
                    border: "none",
                    background: "none",
                    fontSize: 18,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  −
                </button>
                <span style={{ width: 40, textAlign: "center", fontSize: 16, fontWeight: 600 }}>{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  style={{
                    width: 40,
                    height: 48,
                    border: "none",
                    background: "none",
                    fontSize: 18,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="btn-primary"
                style={{ flex: 1, padding: "13px 20px" }}
              >
                {added ? "✓ Added to Cart!" : "Add to Cart"}
              </button>
            </div>

            <Link href="/cart" className="btn-outline" style={{ width: "100%", textAlign: "center", display: "block" }}>
              View Cart
            </Link>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div style={{ marginTop: 36 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 16 }}>
                  Specifications
                </h3>
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
                  {Object.entries(product.specs).map(([key, val], i) => (
                    <div
                      key={key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        padding: "10px 16px",
                        background: i % 2 === 0 ? "var(--accent)" : "#fff",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{key}</span>
                      <span style={{ color: "var(--text)" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="section-title" style={{ marginBottom: 32 }}>Related Products</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 28px !important; margin-bottom: 48px !important; }
          .desktop-only { display: none !important; }
          .mobile-only  { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-only  { display: none !important; }
        }
      `}</style>
    </div>
  );
}
