import {NextFunction, Request, Response} from 'express';
import {ExpenseService} from '../services/ExpenseService';
import {IExpense} from '@hyteck/shared';
import {BaseController} from './generics/BaseController';

const expenseService = new ExpenseService();

export class ExpenseController extends BaseController<IExpense> {

  constructor() {
    super(expenseService);
  }

  createWithReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const expense = expenseService.createWithReceipt(req.body, req.file);
        res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  };


  updateWithReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const expense = expenseService.updateWithReceipt(req.params.id, req.body, req.file);
      res.status(200).json(expense);
    } catch (error) {
      next(error);
    }
  };

} 