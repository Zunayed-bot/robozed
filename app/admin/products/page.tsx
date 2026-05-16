import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProductManagerClient from "./ProductManagerClient";

export const metadata = { title: "Products" };

async function getProducts() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function AdminProductsPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin");

  const products = await getProducts();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 36px", overflow: "auto" }}>
        <ProductManagerClient initialProducts={products} />
      </main>
    </div>
  );
}
