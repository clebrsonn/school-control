import mongoose from "mongoose";

export interface IResponsible extends mongoose.Document{
  name: string;
  email?: string;
  phone: string;
  students: mongoose.Types.ObjectId[]; // Lista de alunos
}
