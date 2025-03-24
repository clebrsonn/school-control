import { IExpense } from '@hyteck/shared/';
import { get } from '../../../config/axios/get.ts';
import { post } from '../../../config/axios/post.ts';
import { axiosPut } from '../../../config/axios/put.ts';
import { axiosDelete } from '../../../config/axios/delete.ts';

export const ExpenseService = {
  getAll: async (): Promise<IExpense[]> => {
    return await get<IExpense[]>('/expenses');
  },

  getById: async (id: string): Promise<IExpense> => {
    return await get<IExpense>(`/expenses/${id}`);
  },

  create: async (data: FormData): Promise<IExpense> => {
    return await post<FormData, IExpense>('/expenses', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  update: async (id: string, data: FormData): Promise<IExpense> => {
    return await axiosPut<FormData, IExpense>(`/expenses/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  delete: async (id: string): Promise<void> => {
    await axiosDelete(`/expenses/${id}`);
  },
}; 