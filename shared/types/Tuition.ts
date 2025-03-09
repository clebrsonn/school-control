import mongoose from "mongoose";
import {IDiscount, IEnrollment, IResponsible} from "./";

export interface ITuition extends mongoose.Document{
  amount: number;
  status: "pending" | "paid" | "late";
  dueDate: Date;
  paymentDate?: Date;
  responsible:  mongoose.Types.ObjectId | IResponsible;
  enrollment: mongoose.Types.ObjectId | IEnrollment;
  discount?: mongoose.Types.ObjectId | IDiscount
}
