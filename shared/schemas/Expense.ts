import {Document, Model, model, models, Schema} from 'mongoose';

export interface IExpense extends Document {
  _id: string;
  date: Date;
  value: number;
  description: string;
  receiptUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    date: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    receiptUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense: Model<IExpense> = models.Expense || model<IExpense>('Expense', expenseSchema); 