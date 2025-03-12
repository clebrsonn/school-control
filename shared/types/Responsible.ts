import mongoose from "mongoose";
import {IDiscount} from "@hyteck/shared/types/Discount";

export interface IResponsible extends mongoose.Document{
  name: string;
  email?: string;
  phone: string;
  students: mongoose.Types.ObjectId[]; // Lista de alunos
  discounts?: mongoose.Types.ObjectId[] | IDiscount[];
}
