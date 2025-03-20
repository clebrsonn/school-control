// filepath: /e:/IdeaProjects/school-control/frontend/src/services/PaymentService.ts

import {ITuition} from "@hyteck/shared";
import {get} from "../config/axios/get";
import {post} from "../config/axios/post";
import {axiosDelete} from "../config/axios/delete.ts";
import {axiosPut} from "../config/axios/put.ts";

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

export const groupPaymentsByParentId = async (parentId: string): Promise<ITuition[]>=> {
  return await get<ITuition[]>(`/payments/parent/debt/${parentId}`);
};

export const updatePayment = async (id: string, paymentData: Partial<ITuition>): Promise<ITuition> => {
  const response = await axiosPut<Partial<ITuition>, ITuition>(`/payments/${id}`, paymentData);
  return response;
}

export const groupPaymentsByMonthAndParent = async (): Promise<any[]> => {
  return await get<any[]>('/payments/grouped/all');
};

export const fetchLatePayments = async () => {
  return await get<ITuition[]>('/payments/late');
};

export const fetchTotalEstimatedForCurrentMonth = async () => {
  return await get<number>('/payments/total-estimated');
};

export const fetchOnTimePayers = async () => {
  return await get<any[]>('/payments/on-time-payers');
};

export const fetchMostLatePayers = async () => {
  return await get<any[]>('/payments/most-late-payers');
};

export const fetchOpenPayments = async () => {
  return await get<any[]>('/payments/open-month');
};
