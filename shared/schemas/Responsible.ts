import mongoose, { Document, Schema } from "mongoose";
import { IDiscount } from "./Discount";

// Interface definition
export interface IResponsible extends Document {
    name: string;
    email?: string;
    phone: string;
    students: mongoose.Types.ObjectId[];
    discounts?: mongoose.Types.ObjectId[] | IDiscount[];
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const ResponsibleSchema = new Schema(
    {
        name: { type: String, required: true },                    // Additional validation: required
        email: { type: String, required: false },                 // Explicitly optional
        phone: { type: String, required: true, unique: true },    // Additional validation: required, unique
        students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
        discounts: [{ type: Schema.Types.ObjectId, ref: 'Discount' }]
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

export const Responsible = mongoose.model<IResponsible>("Responsible", ResponsibleSchema);
