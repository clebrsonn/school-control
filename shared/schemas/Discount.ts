// Interface definition
export interface IDiscount {
    id?: string;
    name: string;
    value: number;
    validUntil: Date;
    type: 'enroll' | 'tuition';  // Using literal types for better type safety
    createdAt: Date;
    updatedAt: Date;
}
