"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    images: string[];
    description: string;
    stock: number;
  };
  delay?: number;
}

export default function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] ?? "",
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const image = product.images[0] ?? "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ textDecoration: "none" }}
      className="animate-fade-up"
      data-delay={delay}
    >
      <article
        className="card"
        style={{ overflow: "hidden", cursor: "pointer" }}
      >
        {/* Image */}
        <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "var(--accent)" }}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover", transition: "transform 0.4s" }}
            className="product-img"
          />
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "var(--primary)",
              color: "#fff",
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            {product.category}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 20px 16px" }}>
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.2px",
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>
              ৳{product.price.toLocaleString()}
            </span>
            <button
              onClick={handleAdd}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              {added ? <CheckIcon /> : <CartIcon />}
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>

      <style>{`
        .product-img { transition: transform 0.4s !important; }
        article:hover .product-img { transform: scale(1.04) !important; }
      `}</style>
    </Link>
  );
}

function CartIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  );
}
