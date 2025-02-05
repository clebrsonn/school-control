import mongoose from "mongoose";
import { IResponsible } from "../types";

const ResponsibleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  
});

export const Responsible = mongoose.model<IResponsible>("Responsible", ResponsibleSchema);
