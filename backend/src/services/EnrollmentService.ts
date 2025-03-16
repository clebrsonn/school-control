import {Enrollment, IEnrollment} from "@hyteck/shared";
import {BaseService} from "./generics/BaseService";

import {PaymentService} from "./PaymentService";
import {ClassService} from "./ClassService";


export class EnrollmentService extends BaseService<IEnrollment> {
    private _paymentService = new PaymentService();
    private classService = new ClassService();

    constructor() {
        super(Enrollment);
    }

    // Getter para obter a instância de PaymentService quando necessário
    private get paymentService(): PaymentService {
        if (!this._paymentService) {
            // Aqui carregamos a dependência de forma tardia
            const {PaymentService} = require("./PaymentService");
            this._paymentService = new PaymentService();
        }
        return this._paymentService;
    }


    create = async (data: Partial<IEnrollment>) => {
        const enrollExist = await this.getEnrollmentsByStudentId(data.student as unknown as string);
        enrollExist.forEach(async enroll => {
            await this.delete(enroll._id as string);
            await this.classService.delete(enroll.classId as unknown as string);
        });

        const instance = new this.model(data);
        //await this.paymentService.generatePaymentRecurrences(payment);
        return await instance.save();
    };


    getEnrollmentsByStudentId = async (studentId: string) => {
        return Enrollment.find({student: studentId}).populate("student").populate("classId");
    };

    renewEnrollment = async (enrollmentId: string) => {
        const enrollment = await this.findById(enrollmentId);
        if (!enrollment) {
            throw new Error("Enrollment not found");
        }
        const newEnrollment = new Enrollment({
            student: enrollment.student,
            classId: enrollment.classId,
            fee: enrollment.fee,
            //discount: enrollment.discount,
            active: true,
        });

        return this.create(newEnrollment);
    };


    cancelEnrollment = async (enrollmentId: string) => {
        const enrollment = await this.findById(enrollmentId);
        if (!enrollment) {
            throw new Error("Enrollment not found");
        }

        await this.paymentService.deleteMany({
            enrollment: enrollment._id,
            status: "pending",
            dueDate: {$gte: new Date()},
        });

        enrollment.active = false;
        await enrollment.save();

        return enrollment;
    };

    findAcitveAndEndDateLessThanToday = async () => {
        return Enrollment.find({active: true, endDate: {$lt: new Date()}});
    }

}