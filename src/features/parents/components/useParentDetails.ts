import { useQuery } from '@tanstack/react-query';
import { fetchParentById, getStudentsByResponsibleId } from '../services/ParentService.ts';
import { getPaymentsByResponsible } from '../../payments/services/PaymentService.ts';

export const useParentDetails = (id: string) => {
    // Query para buscar o responsável
    const {
        data: parent,
        isLoading: parentLoading,
        error: parentError,
        refetch: refetchParent
    } = useQuery({
        queryKey: ['parent', id],
        queryFn: () => fetchParentById(id),
        enabled: !!id
    });

    // Query para buscar os estudantes
    const {
        data: studentsData,
        isLoading: studentsLoading,
        error: studentsError,
        refetch: refetchStudents
    } = useQuery({
        queryKey: ['parent-students', id],
        queryFn: () => getStudentsByResponsibleId(id, { page: 0, size: 100 }),
        enabled: !!id
    });

    // Query para buscar os pagamentos
    const {
        data: monthlyFees,
        isLoading: paymentsLoading,
        error: paymentsError,
        refetch: refetchPayments
    } = useQuery({
        queryKey: ['parent-payments', id],
        queryFn: () => getPaymentsByResponsible(id),
        enabled: !!id
    });

    // Estados combinados para loading e erro
    const isLoading = parentLoading || studentsLoading || paymentsLoading;
    const error = parentError || studentsError || paymentsError || null;

    return {
        parent,
        students: studentsData?.content ?? [],
        monthlyFees: monthlyFees ?? [],
        isLoading,
        error,
        refetchAll: () => {
            refetchParent();
            refetchStudents();
            refetchPayments();
        }
    };
};
