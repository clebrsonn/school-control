import { get, patch, post } from '../../../config/axios';
import { EnrollmentRequest, EnrollmentResponse } from '../types/EnrollmentTypes';

/**
 * Enroll a student
 * @param enrollmentData Enrollment request data
 * @returns Enrollment response
 */
export const enrollStudent = async (enrollmentData: EnrollmentRequest): Promise<EnrollmentResponse> => {
  const response = await post<EnrollmentRequest, EnrollmentResponse>('/enrollments', enrollmentData);
  return response;
};

/**
 * Get student enrollments
 * @param studentId Student ID
 * @returns Array of enrollment responses
 */
export const getStudentEnrollments = async (studentId: string): Promise<EnrollmentResponse[]> => {
  const response = await get<EnrollmentResponse[]>(`/enrollments/students/${studentId}`);
  return response;
};

/**
 * @deprecated This method is not part of the new API specification.
 * Use enrollStudent and getStudentEnrollments instead.
 */
export const cancelEnrollment = async (enrollmentId: string) => {
  const response = await get(`/enrollments/${enrollmentId}/cancel`);
  return response;
};

/**
 * @deprecated This method is not part of the new API specification.
 * Use enrollStudent and getStudentEnrollments instead.
 */
export const renewEnrollment = async (enrollmentId: string) => {
  const response = await get<{ enrollmentId: string }>(`/enrollments/${enrollmentId}/renew`);
  return response;
};

/**
 * Atualiza o valor da mensalidade de uma matrícula
 * @param enrollmentId ID da matrícula
 * @param monthlyFee Novo valor da mensalidade
 * @returns EnrollmentResponse atualizado
 */
export const updateMonthlyFee = async (enrollmentId: string, monthlyFee: number): Promise<EnrollmentResponse> => {
  const response = await patch<{ monthlyFee: number }, EnrollmentResponse>(
    `/enrollments/${enrollmentId}/monthly-fee`,
    { monthlyFee }
  );
  return response;
};

