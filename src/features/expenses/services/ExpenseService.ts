import { axiosDelete, axiosPut, get, post } from '../../../config/axios';
import { PageResponse } from '../../../types/PageResponse';
import { Expense } from '../types/ExpenseTypes.ts';

export const ExpenseService = {
    getAll: async (page = 0, size = 10): Promise<PageResponse<Expense>> => {
        return await get<PageResponse<Expense>>(`/expenses?page=${page}&size=${size}`);
    },

    getById: async (id: string): Promise<Expense> => {
        return await get<Expense>(`/expenses/${id}`);
    },

    create: async (data: FormData): Promise<Expense> => {
        return await post<FormData, Expense>('/expenses', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    update: async (id: string, data: FormData): Promise<Expense> => {
        return await axiosPut<FormData, Expense>(`/expenses/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    delete: async (id: string): Promise<void> => {
        await axiosDelete(`/expenses/${id}`);
    }
}; 
