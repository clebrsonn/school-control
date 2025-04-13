import mongoose, { Document, Schema } from 'mongoose';
import { IResponsible } from './Responsible';
import { IEnrollment } from './Enrollment';
// Interface definition
export interface ITuition extends Document {
    amount: number;
    status: "pending" | "paid" | "late";
    dueDate: Date;
    paymentDate: Date;
    enrollment: mongoose.Types.ObjectId | IEnrollment;
    responsible: mongoose.Types.ObjectId | IResponsible;
    createdAt: Date;
    updatedAt: Date;
}
const TuitionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ["paid", "pending", "late"] },
    dueDate: { type: Date, required: true },
    paymentDate: { type: Date},
    enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment" },
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: "Responsible", required: true },
}, { timestamps: true });
TuitionSchema.pre("save", function (next) {
    if (this.dueDate < new Date()) {
        this.status = "late";
    }
    next();
});
export const Tuition = mongoose.model<ITuition>("Tuition", TuitionSchema);
