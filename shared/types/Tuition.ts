import mongoose from "mongoose";

export interface ITuition extends mongoose.Document{
  amount: number;
  status: "pending" | "paid" | "late";
  dueDate: Date;
  paymentDate?: Date;
  responsible: mongoose.Types.ObjectId;
  enrollment: mongoose.Types.ObjectId;
  discount?: mongoose.Types.ObjectId
}
