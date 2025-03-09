import {NextFunction, Request, Response} from 'express';
import {BaseController} from './generics/BaseController';
import {ITuition} from '@hyteck/shared';
import {PaymentService} from '../services/PaymentService';

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

  // Group payments by month and parent
  groupPaymentsByMonthAndParent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupedPayments = await paymentService.groupPaymentsByMonthAndParent();
      res.status(200).json(groupedPayments);
    } catch (error) {
      console.log(error);
      next(error); // Delegate error to the generic error handler
    }
  };

  getLatePayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const latePayments = await paymentService.getLatePayments();
      res.status(200).json(latePayments);
    } catch (error) {
      next(error);
    }
  };

  getTotalEstimatedForCurrentMonth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalEstimated = await paymentService.getTotalEstimatedForCurrentMonth();
      res.status(200).json(totalEstimated);
    } catch (error) {
      next(error);
    }
  };

  getOnTimePayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onTimePayers = await paymentService.getOnTimePayers();
      res.status(200).json(onTimePayers);
    } catch (error) {
      next(error);
    }
  };

  getMostLatePayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mostLatePayers = await paymentService.getMostLatePayers();
      res.status(200).json(mostLatePayers);
    } catch (error) {
      next(error);
    }
  };

  getOpenPaymentCurrentMonth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mostLatePayers = await paymentService.fetchPendingPaymentsForCurrentMonth();
      res.json(mostLatePayers);
    } catch (error) {
      next(error);
    }
  };

}