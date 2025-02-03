import mongoose from "mongoose";
import { IEnrollment } from "../types";

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  fee: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
},
{ timestamps: true });

export const Enrollment = mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
