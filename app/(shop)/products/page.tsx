import ProductCard from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Link from "next/link";
import SearchBar from "./SearchBar";

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

async function getProducts(category?: string, q?: string) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: "i" };
  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

async function getCategories() {
  await connectDB();
  return (await Product.distinct("category")) as string[];
}

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const [products, categories] = await Promise.all([getProducts(category, q), getCategories()]);

  return (
    <div style={{ padding: "60px 0 96px" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>
            {category ? `Category: ${category}` : "All Products"}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <h1 className="section-title">
              {q ? `Search: "${q}"` : category ? `${category}` : "Our Products"}
            </h1>
            <span style={{ fontSize: 14, color: "var(--text-light)" }}>
              {products.length} item{products.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40, alignItems: "start" }}>
          {/* Sidebar filters */}
          <aside>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 16 }}>
                Categories
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Link
                  href="/products"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: !category ? 600 : 400,
                    color: !category ? "var(--primary)" : "var(--text-muted)",
                    background: !category ? "var(--accent)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: category === cat ? 600 : 400,
                      color: category === cat ? "var(--primary)" : "var(--text-muted)",
                      background: category === cat ? "var(--accent)" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div>
            <SearchBar initialQ={q} />
            {products.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  color: "var(--text-light)",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No products found</p>
                <Link href="/products" className="btn-outline" style={{ marginTop: 16 }}>
                  Clear filters
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {products.map((p: Parameters<typeof ProductCard>[0]["product"], i: number) => (
                  <ProductCard key={p._id} product={p} delay={i * 60} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
          aside { display: none; }
        }
      `}</style>
    </div>
  );
}
