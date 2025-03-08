import mongoose, {Types} from "mongoose";
import {IRole} from "./Role";

export interface IUser extends mongoose.Document {
    username: string;
    passwordHash: string; // Changed from password to passwordHash
    email: string;
    isActive: boolean;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    role?: Types.ObjectId | IRole; // Reference to Role model
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>; // Method for password comparison
}
