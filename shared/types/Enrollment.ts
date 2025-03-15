import mongoose, {Document, Types} from "mongoose";
import {IStudent} from "./Student";
import {IClass} from "./Class";

export interface IEnrollment extends Document {
  student: Types.ObjectId | IStudent;
  classId: mongoose.Types.ObjectId | IClass;
  fee: number;
  tuitionAmount?: number;
  createdAt?: Date;
  active?: boolean;
  endDate?: Date;
}