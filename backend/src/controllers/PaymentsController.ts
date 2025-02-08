import { NextFunction, Request, Response } from 'express';
import { BaseController } from './generics/BaseController';
import { ITuition } from '@hyteck/shared';
import { PaymentService } from '../services/PaymentService';

const paymentService = new PaymentService();

export class PaymentsController extends BaseController<ITuition> {
  constructor() {
    super(paymentService);
  }

  // Get payments by parent ID
  fetchPaymentsByParentId = async (req: Request, res: Response, next: NextFunction) => {
    const { parentId } = req.params; // Extract parent ID from request

    try {
      const payments = await paymentService.getPaymentsByParentId(parentId);
      res.status(200).json(payments);
    } catch (error) {
      next(error); // Delegate error to the generic error handler
    }
  };

  // Get monthly debt for a specific parent
  getMonthlyDebt = async (req: Request, res: Response, next: NextFunction) => {
    const { parentId } = req.params; // Extract parent ID from request

    try {
      const totalDebt = await paymentService.getMonthlyDebtByParentId(parentId);
      res.status(200).json(totalDebt);
    } catch (error) {
      next(error); // Delegate error to the generic error handler
    }
  };
}