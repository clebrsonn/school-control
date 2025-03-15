import mongoose from "mongoose";
import {IEnrollment} from "../types";
import {Student} from "@hyteck/shared/schemas/Student";
import {Responsible} from "@hyteck/shared/schemas/Responsible";
import {Discount} from "@hyteck/shared/schemas/Discount";

const EnrollmentSchema = new mongoose.Schema({
    student: {type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true},
    classId: {type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true},
    fee: {type: Number, required: true},
    tuitionAmount: {type: Number},
    createdAt: {type: Date, default: Date.now},
    active: {type: Boolean, default: true},
    endDate: {type: Date, default: Date.now},
}, {timestamps: true});

EnrollmentSchema.post('save', async function () {
    const student = await Student.findById(this.student as unknown as string);
    if (!student) {
        return (new Error('Student not found'));
    }

    const responsible = await Responsible.findById(student.responsible as unknown as string);
    if (!responsible) {
        return (new Error('Responsible not found'));
    }

    // Atualiza a contagem de alunos
    const totalStudents = await Student.countDocuments({responsible: responsible._id as unknown as string});

    // Calcula desconto
    if (totalStudents >= 2) {
        const discounts = await Discount.find({type: ['tuition', 'enroll']});
        responsible.discounts = [...discounts];
    } else {
        responsible.discounts = [];
    }
    await responsible.save();
});

export const Enrollment = mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);