import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get("orderId")?.trim().toUpperCase();
  if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

  await connectDB();
  const order = await Order.findOne({ orderId }).lean() as {
    orderId: string;
    status: string;
    createdAt: Date;
    items: { name: string; quantity: number; price: number; image: string }[];
    subtotal: number;
    discountCode: string;
    discountPercent: number;
    total: number;
    customer: { fullName: string };
  } | null;

  if (!order) {
    return NextResponse.json({ error: "Order not found. Please check your order ID." }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.orderId,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items,
    subtotal: order.subtotal,
    discountCode: order.discountCode,
    discountPercent: order.discountPercent,
    total: order.total,
    customerName: order.customer.fullName,
  });
}
