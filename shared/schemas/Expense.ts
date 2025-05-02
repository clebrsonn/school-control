export interface IExpense {
  id?: string;
  _id?: string;
  date: Date;
  value: number;
  description: string;
  receiptUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
