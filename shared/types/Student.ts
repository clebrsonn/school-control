import mongoose from "mongoose";
import { IResponsible } from "./Responsible";

export interface IStudent extends mongoose.Document{
  name: string;
  birthDate: Date;
  responsible: mongoose.Types.ObjectId;
  classId: string;
}
