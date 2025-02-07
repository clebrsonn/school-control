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
      await payment.save();
    }
  };

  async getMonthlyDebtByParentId(responsible: string) {
    // Obtém a data inicial e final do mês atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Agregação para calcular o total do mês
    const result = await Tuition.aggregate([
      {
        $match: {
          // Filtra pelos pagamentos do responsável
          responsible: new mongoose.Types.ObjectId(responsible),
          // dueDate: {
          //   $gte: firstDayOfMonth, // Pagamentos a partir do primeiro dia do mês
          //   $lte: lastDayOfMonth,  // Até o último dia do mês
          // },
        },
      },
      {
        $group: {
          _id:  {
            month: { $month: "$dueDate" }, // Extrair o mês da data de vencimento
            year: { $year: "$dueDate" },  // Garantir agrupamento também por ano
          },
          // Agrupa todos os documentos (não agrega valores por campo específico)
          totalDebt: { $sum: "$amount" }, // Soma o campo "amount"
        },
      },{
        $sort: { "_id.month": 1, "_id.amount": 1 }, // Ordena por mês e pelo valor de amount
      }

    ]);

    // Se não encontrar dados, considera a dívida como zero
    return result;
  }



}