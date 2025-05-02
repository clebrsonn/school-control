import { IResponsible } from './Responsible';
import { IEnrollment } from '@hyteck/shared/Enrollment';

export enum TuitionStatus {
    PENDING = "pending",
    PAID = "paid",
    LATE = "paid late",
}

// Interface definition
export interface ITuition {
    id?: string;
    amount: number;
    status: "pending" | "paid" | "late";
    dueDate: Date;
    paymentDate?: Date;
    responsible: string | IResponsible;
    enrollment: string | IEnrollment;
    createdAt: Date;
    updatedAt: Date;
}
