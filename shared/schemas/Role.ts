import mongoose from "mongoose";
import {IRole} from "../types";

const RoleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        permissions: { type: [String], required: true, default: [] }, // Array of permissions
    },
    { timestamps: true }
);

export const Role = mongoose.model<IRole>("Role", RoleSchema);