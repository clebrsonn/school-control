import { IResponsible } from './Responsible';

export interface IFinancialBalance {
    id?: string;
    responsible: string | IResponsible;
    month: Date; // Ex: 2025-03-01
    totalDue: number; // Valor total devido no mês
    totalPaid: number;
    balance: number; // Saldo = totalDue - totalPaid
    createdAt?: Date;
    updatedAt?: Date;
}
