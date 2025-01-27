// filepath: /e:/IdeaProjects/school-control/backend/src/services/PaymentService.ts
import Payment, { IPayment } from '../models/Payment';
import Discount from '../models/Discount';
import Parent from '../models/Parent';

export const createPayment = async (data: IPayment) => {
  const parentExists = await Parent.findById(data.parentId);
  if (!parentExists) {
    throw new Error('Parent not found');
  }

  let finalAmount = data.amount;

  if (data.discountId) {
    const discount = await Discount.findById(data.discountId);
    if (discount) {
      finalAmount = data.amount - (data.amount * (discount.percentage / 100));
    }
  }

  const paymentData: Partial<IPayment> = {
    ...data,
    amount: finalAmount,
  };

  if (!data.discountId) {
    delete paymentData.discountId;
  }

  const payment = new Payment(paymentData);

  return await payment.save();
};

export const getPayments = async () => {
  return await Payment.find().populate('parentId').populate('discountId');
};

export const getPaymentsByParentId = async (parentId: string) => {
  return await Payment.find({ parentId }).populate('parentId').populate('discountId');
};

export const getPaymentById = async (id: string) => {
  return await Payment.findById(id).populate('parentId').populate('discountId');
};

export const updatePaymentById = async (id: string, data: Partial<IPayment>) => {
  return await Payment.findByIdAndUpdate(id, data, { new: true }).populate('parentId').populate('discountId');
};

export const deletePaymentById = async (id: string) => {
  return await Payment.findByIdAndDelete(id);
};