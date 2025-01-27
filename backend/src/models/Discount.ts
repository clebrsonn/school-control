// filepath: /e:/IdeaProjects/school-control/backend/src/models/DiscountModel.ts
import mongoose from 'mongoose';

export interface IDiscount extends mongoose.Document {
  name: string;
  percentage: number;
  validUntil: Date;
}

const discountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
  validUntil: { type: Date, required: true },
});

const Discount = mongoose.model<IDiscount>('Discount', discountSchema);

export default Discount;