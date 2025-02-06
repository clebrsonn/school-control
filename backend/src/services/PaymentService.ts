// filepath: /e:/IdeaProjects/school-control/backend/src/services/PaymentService.ts
import { IEnrollment, ITuition, Tuition} from '@hyteck/shared';
import {BaseService} from "./generics/BaseService";
import {EnrollmentService} from "./EnrollmentService";
import {StudentService} from "./StudentService";
import mongoose from "mongoose";
import {DiscountService} from "./DiscountService";
import {ParentService} from "./ParentService";

export class PaymentService extends BaseService<ITuition>{
  private discountService = new DiscountService();
  private parentService = new ParentService();
  private _enrollmentService!: EnrollmentService;

  constructor() {
    super(Tuition);
    this.populateFields=['enrollment', 'responsible'];
  }

  private get enrollmentService(): EnrollmentService {
    if (!this._enrollmentService) {
      // Aqui carregamos a dependência de forma tardia
      const { EnrollmentService } = require("./EnrollmentService");
      this._enrollmentService = new EnrollmentService();
    }
    return this._enrollmentService;
  }


  getPaymentsByParentId = async (responsible: string) => {
    return Tuition.find({ responsible }).populate('enrollment').sort({ dueDate: 1 });
  };


  generatePaymentRecurrences = async (data: IEnrollment) => {
    const today = new Date();

    const actualMonth= today.getMonth();

    const student= await new StudentService().findById(data.student as unknown as string)
    const parent= (await this.parentService.findById(student?.responsible as unknown as string));

    const discount= parent?.students && parent.students.length > 1 ? await this.discountService.findByType('tuition'): null;
    const monthlyFee = 110 - (discount?.value ?? 0); // Valor da mensalidade
    const discountEnroll= parent?.students && parent.students.length > 1 ? await this.discountService.findByType('enroll'): null;
    data.fee = data.fee - (discountEnroll?.value ?? 0) ;

    await this.enrollmentService.update(data._id as string, {fee: data.fee});

    for (let i = 1; i <= 12 - actualMonth; i++) {
      const dueDate = new Date(today.getFullYear(), actualMonth + i, 10);
      const paymentData: Partial<ITuition> = {
        amount: monthlyFee,
        status: "pending",
        dueDate: dueDate,
        responsible: student?.responsible._id,
        enrollment: data._id as unknown as mongoose.Types.ObjectId,
        discount: discount?._id as mongoose.Types.ObjectId | undefined
      };
      const payment = new Tuition(paymentData);
      console.log('payment', payment);
      await payment.save();
    }
  };


}