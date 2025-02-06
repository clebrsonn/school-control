// filepath: /e:/IdeaProjects/school-control/frontend/src/services/PaymentService.ts

import { ITuition } from "@hyteck/shared";
import { get } from "../config/axios/get";
import { post } from "../config/axios/post";
import {axiosDelete} from "../config/axios/delete.ts";

export const fetchPayments = async () => {
  const response = await get('/payments');
  return response;
};

export const createPayment = async (paymentData: ITuition): Promise<ITuition> => {

  const response = await post<ITuition, ITuition>('/payments', paymentData);
  return response;
};

export const fetchPaymentById = async (id: string): Promise<ITuition> => {
  const response = await get<ITuition>(`/payments/${id}`);
  return response;
};

export const fetchPaymentsByParentId = async (parentId: string): Promise<ITuition[]>=> {
  return await get<ITuition[]>(`/payments/parent/${parentId}`);
};

export const deletePaymentById = async (id: string) => {
  return await axiosDelete<ITuition>(`/payments/${id}`);
};