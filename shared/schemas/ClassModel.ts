/**
 * Represents a class entity with its details.
 */
export interface IClass {
    id?: string;
    name: string;
    startTime: string;
    endTime: string;
    enrollmentFee: number;
    monthlyFee: number;
    createdAt: Date;
    updatedAt: Date;
}
