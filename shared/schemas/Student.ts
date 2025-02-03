import mongoose from "mongoose";
import { IStudent } from "../types";

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthDate: { type: Date },
  responsible: { type: mongoose.Schema.Types.ObjectId, ref: "Responsible", required: true },
});

export const Student = mongoose.model<IStudent>("Student", StudentSchema);
