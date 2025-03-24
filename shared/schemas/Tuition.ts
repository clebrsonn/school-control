import mongoose, { Document, Schema } from 'mongoose';
import { IResponsible } from './Responsible';
import { IEnrollment } from '@hyteck/shared/Enrollment';

export enum TuitionStatus {
    PENDING = "pending",
    PAID = "paid",
    LATE = "paid late",
}

// Interface definition
export interface ITuition extends Document {
    amount: number;
    status: "pending" | "paid" | "late";
    dueDate: Date;
    paymentDate?: Date;
    responsible: mongoose.Types.ObjectId | IResponsible;
    enrollment: mongoose.Types.ObjectId | IEnrollment;
    createdAt: Date;
    updatedAt: Date;
}

const TuitionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: [TuitionStatus.PAID, TuitionStatus.PENDING, TuitionStatus.LATE] },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date, required: false },
  responsible: { type: mongoose.Schema.Types.ObjectId, ref: "Responsible", required: true },
  enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment" },
}, { timestamps: true });

TuitionSchema.pre("save", function(next){
  if(this.dueDate < new Date()){
    this.status = TuitionStatus.LATE;
  }
  next();
});



export const Tuition = mongoose.model<ITuition>("Tuition", TuitionSchema);
