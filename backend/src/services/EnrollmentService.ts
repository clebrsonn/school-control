import {Enrollment, IEnrollment} from "@hyteck/shared";
import {BaseService} from "./generics/BaseService";

import {PaymentService} from "./PaymentService";


export class EnrollmentService extends BaseService<IEnrollment>{
    _paymentService = new PaymentService();

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
        const instance = new this.model(data);
        const payment = await instance.save();
        await this.paymentService.generatePaymentRecurrences(payment);
        return payment;
    };


    getEnrollmentsByStudentId = async (studentId: string) => {
        return Enrollment.find({ student: studentId }).populate("student").populate("classId");
    };


}