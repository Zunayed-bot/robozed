import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscount extends Document {
  code: string;
  percent: number;
  active: boolean;
  createdAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    percent: { type: Number, required: true, min: 1, max: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Discount: Model<IDiscount> =
  mongoose.models.Discount ?? mongoose.model<IDiscount>("Discount", DiscountSchema);

export default Discount;
