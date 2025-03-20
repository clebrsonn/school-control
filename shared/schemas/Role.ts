import mongoose, { Document } from "mongoose";

// Interface definition
export interface IRole extends Document {
    name: string;
    description: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const RoleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },      // Additional validation: unique
        description: { type: String, required: true },             // Additional validation: required
        permissions: { type: [String], required: true, default: [] }, // Array with default value
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

export const Role = mongoose.model<IRole>("Role", RoleSchema);