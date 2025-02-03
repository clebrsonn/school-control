import mongoose, { Schema } from "mongoose";
import { ITuition } from "../types";

const TuitionSchema = new mongoose.Schema({
  responsible: { type: Schema.Types.ObjectId, ref: "Responsible", required: true },
  enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "paid", "late"], default: "pending" },
  paymentDate: { type: Date },

  },
  { timestamps: true }
);

export const Tuition = mongoose.model<ITuition>("Tuition", TuitionSchema);
