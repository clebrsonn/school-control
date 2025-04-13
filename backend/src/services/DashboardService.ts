import { Enrollment, IEnrollment, ITuition, Tuition } from "@hyteck/shared";
import { BaseService } from "./generics/BaseService";

export class DashboardService extends BaseService<IEnrollment> {
    constructor() {
        super(Enrollment);
    }

    getActiveEnrollments = async (): Promise<number> => {
        return await Enrollment.countDocuments({ status: "active" });
    };

    getMonthlyTuitions = async (): Promise<number> => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return await Tuition.countDocuments({
            dueDate: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        });
    };

    getPendingAmount = async (): Promise<number> => {
        const pendingTuitions = await Tuition.find({ status: "pending" });
        return pendingTuitions.reduce((sum, tuition) => sum + tuition.amount, 0);
    };

    getPaymentForecast = async (): Promise<number> => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const tuitions = await Tuition.find({
            dueDate: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        });
        return tuitions.reduce((sum, tuition) => sum + tuition.amount, 0);
    };

    getLatePayments = async (): Promise<ITuition[]> => {
        return await Tuition.find({ status: "late" }).sort({ dueDate: 1 });
    };

    getPaidPayments = async (): Promise<ITuition[]> => {
        return await Tuition.find({ status: "paid" }).sort({ paymentDate: -1 });
    };
}