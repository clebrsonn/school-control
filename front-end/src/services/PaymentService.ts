// filepath: /e:/IdeaProjects/school-control/frontend/src/services/PaymentService.ts

import { get } from "../config/axios/get";
import { post } from "../config/axios/post";

export const fetchPayments = async () => {
  const response = await get('/payments');
  return response;
};

export const addPayment = async (paymentData: any) => {

  if (!paymentData.discountId) {
    delete paymentData.discountId;
  }
  const response = await post('/payments', paymentData);
  return response;
};

export const fetchPaymentById = async (id: string) => {
  const response = await get(`/payments/${id}`);
  return response;
};

export const fetchPaymentsByParentId = async (parentId: string) => {
  return await get(`/payments/parent/${parentId}`);
};
