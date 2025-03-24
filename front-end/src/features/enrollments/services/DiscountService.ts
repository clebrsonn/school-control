import { IDiscount } from '@hyteck/shared';
import { axiosDelete } from '../../../config/axios/delete.ts';
import { axiosPut } from '../../../config/axios/put.ts';
import { post } from '../../../config/axios/post.ts';
import { get } from '../../../config/axios/get.ts';

const API_URL= '/discounts';
export const fetchDiscounts= async (): Promise<IDiscount[]> => {
    try {
        const response = await get<IDiscount[]>(API_URL);
        return response;
    } catch (error) {
        console.error('Error fetching discounts', error);
        throw error;
    }
}

export const createDiscount= async (discount: IDiscount): Promise<IDiscount> => {
    try {
        const response = await post<IDiscount, IDiscount>(API_URL, discount);
        return response;
    } catch (error) {
        console.error('Error creating discount', error);
        throw error;
    }
}

export const updateDiscount= async (id: string, discount: Partial<IDiscount>): Promise<Partial<IDiscount>> => {
    try {
        const response = await axiosPut<Partial<IDiscount>, IDiscount>(`${API_URL}/${id}`, discount);
        return response;
    } catch (error) {
        console.error('Error updating discount', error);
        throw error;
    }
}

export const deleteDiscount=async (id: number): Promise<void> => {
    try {
        await axiosDelete(`${API_URL}/${id}`);
    } catch (error) {
        console.error('Error deleting discount', error);
        throw error;
    }
}
