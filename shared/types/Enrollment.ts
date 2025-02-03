import mongoose from "mongoose";

export interface IEnrollment extends mongoose.Document{
  fee: number;
  discount: string;
  createdAt: Date;
  student: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
}