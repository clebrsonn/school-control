import {NextFunction, Request, Response} from 'express';
import {BaseController} from "./generics/BaseController";
import {ITuition} from "@hyteck/shared";
import {PaymentService} from "../services/PaymentService";

const paymentService = new PaymentService();
export class PaymentsController extends BaseController<ITuition>{
  constructor() {
    super(paymentService);
  }

  fetchPaymentsByParentId = async (req: Request, res: Response) => {
    try {
      const payments = await paymentService.getPaymentsByParentId(req.params.parentId);
      res.status(200).send(payments);
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };

  getMonthlyDebt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {parentId} = req.params; // Obtém o ID do responsável na requisição
      console.log('parentId', parentId);
      const totalDebt = await paymentService.getMonthlyDebtByParentId(parentId);

      res.json({success: true, totalDebt});
    } catch (error) {
      next(error); // Encaminha para o handler de erros genérico
    }

  }

}