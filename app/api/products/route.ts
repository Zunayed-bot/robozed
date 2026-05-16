import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: "i" };
  if (featured === "true") filter.featured = true;

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  if (!body.name || !body.price || !body.category || !body.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!body.slug) {
    body.slug = body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  const product = await Product.create(body);
  return NextResponse.json(product, { status: 201 });
}
