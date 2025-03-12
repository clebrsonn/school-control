import mongoose, {Schema} from "mongoose";
import {ITuition} from "../types";

const TuitionSchema = new mongoose.Schema({
  responsible: { type: Schema.Types.ObjectId, ref: "Responsible", required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "paid", "paid late"], default: "pending" },
  paymentDate: { type: Date },
  enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment" },
  },
  { timestamps: true }
);

TuitionSchema.pre("save", function(next){
  if(this.dueDate < new Date()){
    this.status = "paid late";
  }
  next();

})
export const Tuition = mongoose.model<ITuition>("Tuition", TuitionSchema);
