import mongoose from "mongoose";

//extends mongoose.Document verify if necessary
export interface IDiscount extends mongoose.Document {
  name: string;
  value: number;
  validUntil: Date;
  type: string
}
