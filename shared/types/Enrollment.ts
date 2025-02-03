import {Document, Types} from "mongoose";

export interface IEnrollment extends Document{
  fee: number;
  discount?: Types.ObjectId;
  createdAt: Date;
  student: Types.ObjectId;
  classId: Types.ObjectId;
}