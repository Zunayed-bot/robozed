import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product, { IProduct } from "@/lib/models/Product";
import ProductDetail from "./ProductDetail";
import { Types } from "mongoose";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug }).lean();
  if (!product) return { title: "Product Not Found" };
  return { title: (product as { name: string }).name };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug }).lean();
  if (!product) notFound();

  const p = product as IProduct & { _id: Types.ObjectId };
  const related = await Product.find({
    category: p.category,
    _id: { $ne: p._id },
  })
    .limit(4)
    .lean();

  return (
    <ProductDetail
      product={JSON.parse(JSON.stringify(product))}
      related={JSON.parse(JSON.stringify(related))}
    />
  );
}
