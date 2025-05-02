import { useEffect, useState } from 'react';
import { IResponsible, IStudent } from '@hyteck/shared';
import { PaymentResponse } from '../../payments/types/PaymentTypes';
import { fetchParentById, getStudentsByResponsibleId } from '../services/ParentService.ts';
import { getPaymentsByResponsible } from '../../payments/services/PaymentService.ts';

export const useParentDetails = (id: string) => {
    const [parent, setParent] = useState<IResponsible>();
    const [students, setStudents] = useState<IStudent[]>([]);
    const [monthlyFees, setMonthlyFees] = useState<PaymentResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [parentData, studentData, paymentData] = await Promise.all([
                    fetchParentById(id),
                    getStudentsByResponsibleId(id, { page: 0, size: 100 }),
                    getPaymentsByResponsible(id)
                ]);

                setParent(parentData);
                setStudents(studentData.content);
                setMonthlyFees(paymentData);
            } catch (err) {
                setError((err as Error).message || 'Failed to fetch data');
            }
        };

        fetchData();
    }, [id]);

    return { parent, students, monthlyFees, error };
};
