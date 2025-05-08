// filepath: /e:/IdeaProjects/school-control/frontend/src/services/PaymentService.ts

import { get, post } from '../../../config/axios';
import { PaymentRequest, PaymentResponse } from '../types/PaymentTypes';

/**
 * Process a payment
 * @param paymentData Payment data
 * @returns Payment response
 */
export const processPayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  const response = await post<PaymentRequest, PaymentResponse>('/payments', paymentData);
  return response;
};

/**
 * Get payments by responsible ID
 * @param responsibleId Responsible ID
 * @returns Array of payment responses
 */
export const getPaymentsByResponsible = async (responsibleId: string): Promise<PaymentResponse[]> => {
  return await get<PaymentResponse[]>(`/responsibles/${responsibleId}/payments`);
};

export const getPaymentById = async (id: string): Promise<PaymentResponse> => {
  return await get<PaymentResponse>(`/payments/${id}`);
};
