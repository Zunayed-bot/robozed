import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import OrdersClient from "./OrdersClient";

export const metadata = { title: "Orders" };

type OrderStatus = "pending" | "processing" | "delivered" | "cancelled";

async function getOrders(status?: string) {
  await connectDB();
  const filter = status ? { status: status as OrderStatus } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(orders));
}

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin");

  const { status } = await searchParams;
  const orders = await getOrders(status);

  const statusOptions = ["", "pending", "processing", "delivered", "cancelled"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 36px", overflow: "auto" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Orders
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {statusOptions.map((s) => (
            <Link
              key={s || "all"}
              href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: status === s || (!status && s === "") ? 600 : 400,
                color: status === s || (!status && s === "") ? "#fff" : "var(--text-muted)",
                background: status === s || (!status && s === "") ? "var(--primary)" : "var(--surface)",
                border: "1.5px solid",
                borderColor: status === s || (!status && s === "") ? "var(--primary)" : "var(--border)",
                textDecoration: "none",
                textTransform: "capitalize",
                transition: "all 0.2s",
              }}
            >
              {s || "All"}
            </Link>
          ))}
        </div>

        <OrdersClient orders={orders} />
      </main>
    </div>
  );
}
