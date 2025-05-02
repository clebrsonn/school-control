import { IStudent } from './Student';
import { IClass } from './ClassModel';

// Interface definition
export interface IEnrollment {
    id?: string;
    student: IStudent;
    classId: IClass;
    fee: number;
    tuitionAmount?: number;
    active: boolean;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
