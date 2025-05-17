import { axiosDelete, axiosPut, get, post } from '../../../config/axios';
import { PageResponse } from '../../../types/PageResponse';
import { DiscountRequest, DiscountResponse } from '../../billing/types/Discount.ts';

const API_URL = '/discounts';
export const fetchDiscounts = async (page = 0, size = 10): Promise<PageResponse<DiscountResponse>> => {
    return await get<PageResponse<DiscountResponse>>(`${API_URL}?page=${page}&size=${size}`);
};

export const createDiscount = async (discount: DiscountRequest): Promise<DiscountResponse> => {
    return await post<DiscountRequest, DiscountResponse>(API_URL, discount);
};

export const updateDiscount = async (id: string, discount: Partial<DiscountRequest>): Promise<Partial<DiscountResponse>> => {
    return await axiosPut<Partial<DiscountRequest>, DiscountResponse>(`${API_URL}/${id}`, discount);
};

export const deleteDiscount = async (id: string): Promise<void> => {
    await axiosDelete(`${API_URL}/${id}`);

};
