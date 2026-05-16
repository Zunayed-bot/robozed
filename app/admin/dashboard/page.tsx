import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

async function getStats() {
  await connectDB();
  const [totalOrders, totalProducts, recentOrders, revenue] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
  ]);
  const pendingOrders = await Order.countDocuments({ status: "pending" });
  return {
    totalOrders,
    totalProducts,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    revenue: revenue[0]?.total ?? 0,
    pendingOrders,
  };
}

export default async function DashboardPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin");

  const stats = await getStats();

  const statCards = [
    { label: "Total Revenue", value: `৳${stats.revenue.toLocaleString()}`, icon: "💰", color: "var(--primary)" },
    { label: "Total Orders", value: stats.totalOrders, icon: "📦", color: "#7C3AED" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "#D97706" },
    { label: "Products", value: stats.totalProducts, icon: "🔧", color: "#059669" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 36px", overflow: "auto" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Welcome back, admin</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 48 }}>
          {statCards.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="card animate-fade-up"
              style={{ padding: "24px 24px 20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-light)", padding: "3px 8px", background: "var(--accent)", borderRadius: 6 }}>
                  All time
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color, letterSpacing: "-0.5px", marginBottom: 4 }}>
                {value}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Recent Orders</h2>
            <Link href="/admin/orders" className="btn-ghost" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--accent)" }}>
                  {["Order ID", "Customer", "Total", "Status", "Date", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-light)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-light)", fontSize: 14 }}>
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order: { _id: string; orderId: string; customer: { fullName: string }; total: number; status: string; createdAt: string }) => (
                    <tr key={order._id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                        #{order.orderId}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text)" }}>
                        {order.customer.fullName}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        ৳{order.total.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span className={`badge badge-${order.status}`}>{order.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-light)" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Link href={`/admin/orders/${order._id}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
