import mongoose from "mongoose";
import {IToken} from "../types";

const TokenSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        userAgent: { type: String, required: true },
    },
    { timestamps: true }
);

export const Token = mongoose.model<IToken>("Token", TokenSchema);