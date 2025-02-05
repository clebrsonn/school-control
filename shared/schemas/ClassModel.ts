import mongoose from "mongoose";
import { IClass } from "../types";

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  enrollmentFee: { type: Number, required: true },
  monthlyFee: { type: Number, required: true },
});

export const ClassModel = mongoose.model<IClass>("Class", ClassSchema);
