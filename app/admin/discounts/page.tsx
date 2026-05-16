import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/lib/models/Discount";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DiscountsClient from "./DiscountsClient";

export const metadata = { title: "Discounts" };

export default async function DiscountsPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin");

  await connectDB();
  const discounts = await Discount.find().sort({ createdAt: -1 }).lean();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 36px", overflow: "auto" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Discount Codes
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Create percentage-based codes that customers apply at checkout
          </p>
        </div>
        <DiscountsClient discounts={JSON.parse(JSON.stringify(discounts))} />
      </main>
    </div>
  );
}
