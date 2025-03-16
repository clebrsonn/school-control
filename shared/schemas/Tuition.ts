import mongoose, { Schema, Document } from "mongoose";
import { IResponsible } from "./Responsible";

// Interface definition
export interface ITuition extends Document {
    amount: number;
    status: "pending" | "paid" | "late";
    dueDate: Date;
    paymentDate?: Date;
    responsible: mongoose.Types.ObjectId | IResponsible;
    createdAt: Date;
    updatedAt: Date;
}

const TuitionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ["pending", "paid", "paid late"] },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date, required: false },
  responsible: { type: mongoose.Schema.Types.ObjectId, ref: "Responsible", required: true },
  enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment" },
}, { timestamps: true });

TuitionSchema.pre("save", function(next){
  if(this.dueDate < new Date()){
    this.status = "paid late";
  }
  next();
});

export const Tuition = mongoose.model<ITuition>("Tuition", TuitionSchema);
