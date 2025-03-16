import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { IRole } from "./Role";

// Interface definition
export interface IUser extends mongoose.Document {
    username: string;
    passwordHash: string;
    email: string;
    isActive: boolean;
    passwordResetToken?: string;      // Optional in interface
    passwordResetExpires?: Date;      // Optional in interface
    role: Types.ObjectId | IRole;     // Can be either ObjectId or IRole type
    createdAt: Date;                  // Added by timestamps
    updatedAt: Date;                  // Added by timestamps
    comparePassword(password: string): Promise<boolean>;
}

// Schema definition
const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },     // Additional validation: unique
        passwordHash: { type: String, required: true },               // Additional validation: required
        email: { type: String, required: true, unique: true },        // Additional validation: unique, required
        isActive: { type: Boolean, default: false },                  // Additional default value
        passwordResetToken: { type: String, required: false },        // Explicit required: false
        passwordResetExpires: { type: Date, required: false },        // Explicit required: false
        role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, // Additional validation: required, ref
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
    if (this.isModified('passwordHash')) {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>("Users", UserSchema);