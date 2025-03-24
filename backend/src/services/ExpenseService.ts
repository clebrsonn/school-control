import { Expense, IExpense } from '@hyteck/shared/';
import { BaseService } from './generics/BaseService';

export class ExpenseService extends BaseService<IExpense> {
  constructor() {
    super(Expense);
    
    this.sortFields = { date: -1 };
  }

  async createWithReceipt(data: IExpense, receiptFile?: Express.Multer.File): Promise<IExpense> {
    try {
      let receiptUrl: string | undefined;
      if (receiptFile) {

        receiptUrl = `/${receiptFile.path}/${receiptFile.filename}`;
      }

      const expenseData = {
        ...data,
        receiptUrl,
      };

      return await this.create(expenseData);
    } catch (error) {
      console.error('Error creating expense with receipt:', error);
      throw error;
    }
  }

  async updateWithReceipt(id: string, data: IExpense, receiptFile?: Express.Multer.File): Promise<IExpense> {
    try {
      let receiptUrl = data.receiptUrl;

      if (receiptFile) {
        receiptUrl = `/uploads/receipt/${receiptFile.filename}`;
      }

      const expenseData = {
        ...data,
        receiptUrl,
      };

      const updated = await this.update(id, expenseData);
      if (!updated) {
        throw new Error('Expense not found');
      }
      return updated;
    } catch (error) {
      console.error('Error updating expense with receipt:', error);
      throw error;
    }
  }
} 