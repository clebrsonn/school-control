import { get } from '../config/axios';
import { EnrollmentResponse } from '../features/enrollments/types/EnrollmentTypes.ts';
import { PaymentResponse } from '../features/payments/types/PaymentTypes.ts';

export const fetchMonthlyFeesByParentId = async (parentId: string) :Promise<PaymentResponse[]> => {
  const response = await get<PaymentResponse[]>(`/payments/parents/${parentId}`);
  return response;
};

export const fetchEnrollmentByStudent = async (studentId: string): Promise<EnrollmentResponse[]> => {
  const response = await get<EnrollmentResponse[]>(`/enrollments/students/${studentId}`);
  return response; // Retorna a matrícula
};