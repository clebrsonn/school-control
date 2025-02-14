import {Document, Types} from "mongoose";
import {IClass} from "@hyteck/shared/types/Class";
import {IStudent} from "@hyteck/shared/types/Student";
import {IDiscount} from "@hyteck/shared/types/Discount";

export interface IEnrollment extends Document{
  fee: number;
  discount?: Types.ObjectId | IDiscount;
  createdAt: Date;
  student: Types.ObjectId | IStudent;
  classId: Types.ObjectId | IClass;
}