import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/lib/models/Discount";
import { getAdminFromCookie } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();
  await Discount.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { active } = await req.json();
  await connectDB();
  const discount = await Discount.findByIdAndUpdate(id, { active }, { new: true }).lean();
  return NextResponse.json(discount);
}
