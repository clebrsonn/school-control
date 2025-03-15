import mongoose, { Document } from "mongoose";

// Interface definition
export interface IDiscount extends Document {
    name: string;
    value: number;
    validUntil: Date;
    type: 'enroll' | 'tuition';  // Using literal types for better type safety
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const DiscountSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },                    // Additional validation: required
        value: { type: Number, required: true },                   // Additional validation: required
        validUntil: { type: Date, required: true },               // Additional validation: required
        type: { type: String, required: true, enum: ['enroll', 'tuition'] }, // Additional validation: enum
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

export const Discount = mongoose.model<IDiscount>('Discount', DiscountSchema);