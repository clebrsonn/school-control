import {Document, Types} from "mongoose";
import {IDiscount} from "./Discount";
import {IStudent} from "./Student";
import {IClass} from "./Class";


export interface IEnrollment extends Document{
  fee: number;
  discount?: Types.ObjectId | IDiscount;
  createdAt: Date;
  student: Types.ObjectId | IStudent;
  classId: Types.ObjectId | IClass;
}