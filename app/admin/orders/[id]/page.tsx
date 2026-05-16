import { redirect, notFound } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import AdminSidebar from "@/components/admin/AdminSidebar";
import OrderDetailClient from "./OrderDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Order Detail" };

export default async function OrderDetailPage({ params }: Props) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin");

  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) notFound();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 36px", overflow: "auto" }}>
        <OrderDetailClient order={JSON.parse(JSON.stringify(order))} />
      </main>
    </div>
  );
}
