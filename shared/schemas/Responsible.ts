import mongoose, {Schema} from "mongoose";
import {IResponsible} from "../types";

const ResponsibleSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true, unique: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  discounts: [{
    type: Schema.Types.ObjectId,
    ref: 'Discount'
  }]


});

export const Responsible = mongoose.model<IResponsible>("Responsible", ResponsibleSchema);
