// filepath: /e:/IdeaProjects/school-control/backend/src/services/DiscountService.ts
import { Discount, IDiscount } from "@hyteck/shared";

export const createDiscount = async (data: IDiscount) => {
  const discount = new Discount(data);
  return discount.save();
};

export const getDiscounts = async () => {
  return Discount.find();
};

export const getDiscountsByType = async (type: string) => {
  return Discount.findOne({ type });
};