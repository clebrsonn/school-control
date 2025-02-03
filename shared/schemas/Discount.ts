import mongoose from "mongoose";
import { IDiscount } from "../types";

const discountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    percentage: { type: Number, required: true },
    validUntil: { type: Date, required: true },
  });
  
  export const Discount = mongoose.model<IDiscount>('Discount', discountSchema);