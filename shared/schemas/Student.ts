import mongoose, { Document } from 'mongoose';
import { IResponsible } from './Responsible';

// Interface definition
export interface IStudent extends Document {
    name: string;
    birthDate?: Date;
    responsible: mongoose.Types.ObjectId | IResponsible;
    classId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const StudentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },                    // Additional validation: required
        birthDate: { type: Date, required: false },                // Additional validation: required
        responsible: { type: mongoose.Schema.Types.ObjectId, ref: "Responsible", required: true },
        classId: { type: String, required: true },                // Additional validation: required
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

export const Student = mongoose.model<IStudent>("Student", StudentSchema);
