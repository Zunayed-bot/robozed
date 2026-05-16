import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { getAdminFromCookie } from "@/lib/auth";
import { generateReceiptPDF } from "@/lib/pdf";
import { sendOrderNotification } from "@/lib/email";
import { nanoid } from "@/lib/nanoid";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  type OrderStatus = "pending" | "processing" | "delivered" | "cancelled";
  const filter = status ? { status: status as OrderStatus } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const { customer, items, total, subtotal, discountCode, discountPercent } = body;
  if (!customer?.fullName || !customer?.phone || !customer?.address) {
    return NextResponse.json({ error: "Missing customer information" }, { status: 400 });
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items in order" }, { status: 400 });
  }

  const orderId = nanoid();
  const order = await Order.create({
    orderId, customer, items,
    subtotal: subtotal ?? total,
    discountCode: discountCode ?? "",
    discountPercent: discountPercent ?? 0,
    total,
    status: "pending",
  });

  // Generate PDF and send email in background — don't block the response
  (async () => {
    try {
      const pdfBuffer = await generateReceiptPDF({
        orderId: order.orderId,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        discountCode: order.discountCode,
        discountPercent: order.discountPercent,
        total: order.total,
        createdAt: order.createdAt,
      });
      await sendOrderNotification(
        {
          orderId: order.orderId,
          customer: order.customer,
          items: order.items,
          total: order.total,
          createdAt: order.createdAt,
        },
        pdfBuffer
      );
    } catch {
      // Email failure is non-critical
    }
  })();

  return NextResponse.json({ orderId: order.orderId, _id: order._id }, { status: 201 });
}
