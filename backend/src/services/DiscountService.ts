// filepath: /e:/IdeaProjects/school-control/backend/src/services/DiscountService.ts
import Discount, { IDiscount } from '../models/Discount';

export const createDiscount = async (data: IDiscount) => {
  const discount = new Discount(data);
  return await discount.save();
};

export const getDiscounts = async () => {
  return await Discount.find();
};