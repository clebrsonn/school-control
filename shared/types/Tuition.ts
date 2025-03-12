import mongoose from "mongoose";
import {IResponsible} from "./";

export interface ITuition extends mongoose.Document{
  amount: number;
  status: "pending" | "paid" | "late";
  dueDate: Date;
  paymentDate?: Date;
  responsible:  mongoose.Types.ObjectId | IResponsible;
  // enrollment: mongoose.Types.ObjectId | IEnrollment;
}
