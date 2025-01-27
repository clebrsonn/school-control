// filepath: /e:/IdeaProjects/school-control/backend/src/controllers/DiscountsController.ts
import { Request, Response } from 'express';
import { createDiscount, getDiscounts } from '../services/DiscountService';

export const addDiscount = async (req: Request, res: Response) => {
  try {
    const discount = await createDiscount(req.body);
    res.status(201).send(discount);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const fetchDiscounts = async (req: Request, res: Response) => {
  try {
    const discounts = await getDiscounts();
    res.status(200).send(discounts);
  } catch (error) {
    res.status(400).send(error);
  }
};