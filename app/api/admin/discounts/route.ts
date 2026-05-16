import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/lib/models/Discount";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const discounts = await Discount.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(discounts);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { code, percent } = await req.json();
  if (!code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (!percent || percent < 1 || percent > 100)
    return NextResponse.json({ error: "Percent must be 1–100" }, { status: 400 });
  try {
    const discount = await Discount.create({ code: code.trim().toUpperCase(), percent });
    return NextResponse.json(discount, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }
}
