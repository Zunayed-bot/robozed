import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { getAdminFromCookie } from "@/lib/auth";
import { generateReceiptPDF } from "@/lib/pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id).lean() as {
    orderId: string;
    customer: { fullName: string; phone: string; address: string; email?: string };
    items: { name: string; quantity: number; price: number }[];
    subtotal?: number;
    discountCode?: string;
    discountPercent?: number;
    total: number;
    createdAt: Date;
  } | null;

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${order.orderId}.pdf"`,
    },
  });
}
