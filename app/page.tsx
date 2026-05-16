export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shop/Navbar";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { CartProvider } from "@/context/CartContext";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

async function getFeaturedProducts() {
  try {
    await connectDB();
    const products = await Product.find({ featured: true }).limit(6).lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    await connectDB();
    const cats = await Product.distinct("category");
    return cats as string[];
  } catch {
    return [];
  }
}

export default async function RootPage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <CartProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <>
            {/* Hero */}
            <section
              style={{
                background: "linear-gradient(135deg, var(--primary-darker) 0%, var(--primary) 60%, var(--primary-light) 100%)",
                color: "#fff",
                padding: "80px 24px 100px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 40%)`,
                }}
              />

              <div className="container" style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
                <div className="animate-fade-up">
                  <p className="section-label" style={{ color: "var(--accent-mid)", marginBottom: 16 }}>
                    Microchips · Robotics · Gadgets
                  </p>
                  <h1
                    style={{
                      fontSize: "clamp(36px, 5vw, 60px)",
                      fontWeight: 800,
                      letterSpacing: "-1.5px",
                      lineHeight: 1.08,
                      marginBottom: 24,
                      color: "#fff",
                    }}
                  >
                    Power Your
                    <br />
                    <span style={{ color: "var(--accent-mid)" }}>Next Build</span>
                  </h1>
                  <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
                    Premium components for makers, engineers, and innovators. From microcontrollers to robotic actuators — everything you need to bring your ideas to life.
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link href="/products" className="btn-primary" style={{ background: "#fff", color: "var(--primary)", padding: "14px 32px", fontSize: 15 }}>
                      Shop Now
                    </Link>
                    <Link href="/products" className="btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff", padding: "13px 32px", fontSize: 15 }}>
                      Browse Categories
                    </Link>
                  </div>
                </div>

                {/* Hero visual */}
                <div className="animate-fade-up delay-200" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {/* Outer glow ring */}
                  <div style={{
                    width: 340,
                    height: 340,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 60px rgba(1,136,199,0.35), inset 0 0 40px rgba(255,255,255,0.04)",
                  }}>
                    {/* Inner white circle — the actual badge */}
                    <div style={{
                      width: 272,
                      height: 272,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 40px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,255,255,0.5)",
                      overflow: "hidden",
                      padding: 28,
                    }}>
                      <Image src="/logo-icon.png" alt="RoboZed" width={200} height={130} style={{ objectFit: "contain", display: "block" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="container" style={{ position: "relative", marginTop: 60 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, maxWidth: 560 }}>
                  {[
                    { value: "500+", label: "Products" },
                    { value: "10K+", label: "Happy Makers" },
                    { value: "50+", label: "Categories" },
                  ].map(({ value, label }) => (
                    <div key={label} style={{ textAlign: "center", padding: "0 16px" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{value}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
              <section style={{ padding: "80px 0" }}>
                <div className="container">
                  <p className="section-label" style={{ marginBottom: 12 }}>Browse</p>
                  <h2 className="section-title" style={{ marginBottom: 40 }}>Shop by Category</h2>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/products?category=${encodeURIComponent(cat)}`}
                        style={{
                          padding: "10px 22px",
                          borderRadius: 999,
                          border: "1.5px solid var(--border)",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--text-muted)",
                          textDecoration: "none",
                          background: "#fff",
                          transition: "all 0.2s",
                          textTransform: "capitalize",
                        }}
                        className="category-pill"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Featured Products */}
            <section style={{ padding: "0 0 96px" }}>
              <div className="container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
                  <div>
                    <p className="section-label" style={{ marginBottom: 8 }}>Hand-picked</p>
                    <h2 className="section-title">Featured Products</h2>
                  </div>
                  <Link href="/products" className="btn-ghost" style={{ fontSize: 14, color: "var(--primary)", fontWeight: 600 }}>
                    View all →
                  </Link>
                </div>

                {featured.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-light)" }}>
                    <p>No products yet. Add some from the admin panel.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                    {featured.map((p: Parameters<typeof ProductCard>[0]["product"], i: number) => (
                      <ProductCard key={p._id} product={p} delay={i * 100} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* CTA Banner */}
            <section
              style={{
                background: "var(--accent)",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                padding: "72px 24px",
                textAlign: "center",
              }}
            >
              <div className="container">
                <p className="section-label" style={{ marginBottom: 12 }}>Ready to build?</p>
                <h2 className="section-title" style={{ marginBottom: 16, color: "var(--primary)" }}>
                  Find the Right Components
                </h2>
                <p style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
                  Browse our full catalogue of microchips, robotics kits, and gadgets. No account needed — just add to cart and checkout.
                </p>
                <Link href="/products" className="btn-primary" style={{ padding: "14px 36px", fontSize: 15 }}>
                  Explore All Products
                </Link>
              </div>
            </section>
          </>
        </main>
        <Footer />
      </div>

      <style>{`
        .category-pill:hover { background: var(--primary) !important; color: #fff !important; border-color: var(--primary) !important; }
        @media (max-width: 768px) {
          .container > div:first-child { grid-template-columns: 1fr !important; }
          .container > div:first-child > div:last-child { display: none !important; }
        }
      `}</style>
    </CartProvider>
  );
}
