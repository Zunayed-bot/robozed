import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/lib/models/Discount";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code?.trim()) return NextResponse.json({ error: "No code provided" }, { status: 400 });
  await connectDB();
  const discount = await Discount.findOne({ code: code.trim().toUpperCase(), active: true }).lean();
  if (!discount) return NextResponse.json({ error: "Invalid or inactive discount code" }, { status: 404 });
  return NextResponse.json({ code: discount.code, percent: discount.percent });
}
