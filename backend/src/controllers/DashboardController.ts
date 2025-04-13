import { NextFunction, Request, Response } from 'express';
import { IEnrollment, ITuition } from '@hyteck/shared';
import { BaseController } from './generics/BaseController';
import { DashboardService } from '../services/DashboardService';

const dashboardService = new DashboardService();

export class DashboardController extends BaseController<IEnrollment> {
    constructor() {
        super(dashboardService);
    }
    index = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const [
                activeEnrollments,
                monthlyTuitions,
                pendingAmount,
                paymentForecast,
                latePayments,
                paidPayments
            ] = await Promise.all([
                dashboardService.getActiveEnrollments(),
                dashboardService.getMonthlyTuitions(),
                dashboardService.getPendingAmount(),
                dashboardService.getPaymentForecast(),
                dashboardService.getLatePayments(),
                dashboardService.getPaidPayments()
            ]);

            res.json({
                activeEnrollments,
                monthlyTuitions,
                pendingAmount,
                paymentForecast,
                latePayments,
                paidPayments
            });
        } catch (error) {
            next(error);
        }
    };
}