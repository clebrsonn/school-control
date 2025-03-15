import mongoose, { Document } from "mongoose";
import { IUser } from "./User";

// Interface definition
export interface IToken extends Document {
    userId: mongoose.Types.ObjectId | IUser;
    token: string;
    expiresAt: Date;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const TokenSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Reference to User model
        token: { type: String, required: true },                                        // Additional validation: required
        expiresAt: { type: Date, required: true },                                     // Additional validation: required
        userAgent: { type: String, required: true },                                   // Additional validation: required
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

export const Token = mongoose.model<IToken>("Token", TokenSchema);