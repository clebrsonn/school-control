import mongoose from "mongoose";

/**
 * Represents a class entity with its details.
 */
export interface IClass extends mongoose.Document {
    name: string;
    startTime: string;
    endTime: string;
    enrollmentFee: number;
    monthlyFee: number;
}
