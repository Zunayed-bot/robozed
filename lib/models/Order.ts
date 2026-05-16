import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  orderId: string;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    email?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  discountCode: string;
  discountPercent: number;
  total: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  pdfPath?: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, default: "" },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, default: "" },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discountCode: { type: String, default: "" },
    discountPercent: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancelled"],
      default: "pending",
    },
    pdfPath: { type: String },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
