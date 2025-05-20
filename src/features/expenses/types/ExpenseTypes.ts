export interface Expense extends ExpenseRequest {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ExpenseRequest {
    date: Date;
    value: number;
    description: string;
    receiptUrl?: string;
}