import mongoose from "mongoose";
import { IDiscount } from "../types";

const discountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, required: true },
    validUntil: { type: Date, required: true },
    type: { type: String, required: true, enum: ['enroll', 'tuition'] },
  });
  
  export const Discount = mongoose.model<IDiscount>('Discount', discountSchema);