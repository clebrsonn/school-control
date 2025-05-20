export interface StatementLineItem {
  invoiceId: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface ConsolidatedStatement {
  responsibleId: string;
  responsibleName: string;
  referenceMonth: {
    year: number;
    month: string;
    monthValue: number;
    leapYear: boolean;
  };
  totalAmountDue: number;
  overallDueDate: string;
  items: StatementLineItem[];
  paymentLink: string;
  barcode: string;
}