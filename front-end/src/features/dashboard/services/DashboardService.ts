import { IEnrollment, ITuition } from '@hyteck/shared';
import axios from 'axios';

interface DashboardData {
    activeEnrollments: number;
    monthlyTuitions: number;
    pendingAmount: number;
    paymentForecast: number;
    latePayments: ITuition[];
    paidPayments: ITuition[];
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
    const response = await axios.get<DashboardData>('/dashboard');
    return response.data;
};