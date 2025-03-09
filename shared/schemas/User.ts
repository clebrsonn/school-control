import mongoose from "mongoose";
import {IUser} from "../types";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true }, // Store the hashed password
        email: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: false },
        passwordResetToken: { type: String, required: false },
        passwordResetExpires: { type: Date, required: false },
        role: { type: mongoose.Schema.Types.ObjectId, ref:  "Role", required: true }, // Add role field
    },
    { timestamps: true }
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