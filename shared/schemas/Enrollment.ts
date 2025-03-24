import mongoose, { Document } from 'mongoose';
import { IStudent, Student } from './Student';
import { Responsible } from './Responsible';
import { Discount } from './Discount';
import { IClass } from './ClassModel';

// Interface definition
export interface IEnrollment extends Document {
    student: mongoose.Types.ObjectId | IStudent;
    classId: mongoose.Types.ObjectId | IClass;
    fee: number;
    tuitionAmount?: number;
    active: boolean;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition
const EnrollmentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
        fee: { type: Number, required: true },
        tuitionAmount: { type: Number },
        active: { type: Boolean, default: true },
        endDate: { type: Date, default: Date.now },
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

// Post-save hook to handle discounts
EnrollmentSchema.post('save', async function () {
    const student = await Student.findById(this.student as unknown as string);
    if (!student) {
        return (new Error('Student not found'));
    }

    const responsible = await Responsible.findById(student.responsible as unknown as string);
    if (!responsible) {
        return (new Error('Responsible not found'));
    }

    // Update student count
    const totalStudents = await Student.countDocuments({ responsible: responsible._id as unknown as string });

    // Calculate discount
    if (totalStudents >= 2) {
        const discounts = await Discount.find({ type: ['tuition', 'enroll'] });
        responsible.discounts = [...discounts];
    } else {
        responsible.discounts = [];
    }
    await responsible.save();
});

export const Enrollment = mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);