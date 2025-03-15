import mongoose, { Document } from "mongoose";

/**
 * Represents a class entity with its details.
 */
export interface IClass extends Document {
    name: string;
    startTime: string;
    endTime: string;
    enrollmentFee: number;
    monthlyFee: number;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const ClassSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },                    // Additional validation: required
        startTime: { type: String, required: true },               // Additional validation: required
        endTime: { type: String, required: true },                 // Additional validation: required
        enrollmentFee: { type: Number, required: true },           // Additional validation: required
        monthlyFee: { type: Number, required: true },              // Additional validation: required
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

export const ClassModel = mongoose.model<IClass>("Class", ClassSchema);
