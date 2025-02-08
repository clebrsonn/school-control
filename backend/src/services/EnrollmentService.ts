import {Enrollment, IEnrollment} from "@hyteck/shared";
import {BaseService} from "./generics/BaseService";

import {PaymentService} from "./PaymentService";
import {ClassService} from "./ClassService";


export class EnrollmentService extends BaseService<IEnrollment>{
    private _paymentService = new PaymentService();
    private classService = new ClassService();
    constructor() {
        super(Enrollment);
    }

    // Getter para obter a instância de PaymentService quando necessário
    private get paymentService(): PaymentService {
        if (!this._paymentService) {
            // Aqui carregamos a dependência de forma tardia
            const { PaymentService } = require("./PaymentService");
            this._paymentService = new PaymentService();
        }
        return this._paymentService;
    }


    create = async (data: Partial<IEnrollment>) => {
        const enrollExist= await this.getEnrollmentsByStudentId(data.student as unknown as string);
        enrollExist.forEach(async enroll => {
            await this.delete(enroll._id as string);
            await this.classService.delete(enroll.classId as unknown as string);
        });

        const instance = new this.model(data);
        const payment = await instance.save();
        await this.paymentService.generatePaymentRecurrences(payment);
        return payment;
    };


    getEnrollmentsByStudentId = async (studentId: string) => {
        return Enrollment.find({ student: studentId }).populate("student").populate("classId");
    };


}