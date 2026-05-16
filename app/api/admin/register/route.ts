import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { sendAdminAccessRequest } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await Admin.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    approved: false,
  });

  try {
    await sendAdminAccessRequest(name, email);
  } catch {
    // Email failure is non-critical
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
