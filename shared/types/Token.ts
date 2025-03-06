import mongoose, {Document} from "mongoose";
import {IUser} from "./User";

export interface IToken extends Document {
    userId: mongoose.Types.ObjectId | IUser;
    token: string;
    expiresAt: Date;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}
