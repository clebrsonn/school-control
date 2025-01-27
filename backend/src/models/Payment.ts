// filepath: /e:/IdeaProjects/school-control/backend/src/models/PaymentModel.ts
import mongoose from 'mongoose';

export interface IPayment extends mongoose.Document {
  amount: number;
  date: Date;
  discountId?: mongoose.Schema.Types.ObjectId;
  parentId: mongoose.Schema.Types.ObjectId;
}

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  discountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount', required: false },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
});

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;