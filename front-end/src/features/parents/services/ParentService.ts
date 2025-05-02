import { IResponsible } from '@hyteck/shared';
import { axiosDelete } from '../../../config/axios/delete.ts';
import { get } from '../../../config/axios/get.ts';
import { post } from '../../../config/axios/post.ts';
import { axiosPut } from '../../../config/axios/put.ts';
import { PageResponse } from '../../../types/PageResponse';
import { ResponsibleRequest, ResponsibleResponse } from '../types/ResponsibleTypes';

const API_URL = '/responsibles';

/**
 * Get all responsibles
 * @param pageable Pagination parameters
 * @returns Page of responsible responses
 */
export const getAllResponsibles = async (pageable: { page: number, size: number, sort?: string[] }): Promise<PageResponse<ResponsibleResponse>> => {
  const response = await get<PageResponse<ResponsibleResponse>>(API_URL, { params: pageable });
  return response;
};

// Legacy method - kept for backward compatibility
export const fetchParents = async (page = 0, size = 10) => {
  const response = await get<PageResponse<IResponsible>>(`${API_URL}?page=${page}&size=${size}`);
  return response;
};

/**
 * Create responsible
 * @param responsibleData Responsible request data
 * @returns Responsible response
 */
export const createResponsible = async (responsibleData: ResponsibleRequest): Promise<ResponsibleResponse> => {
  const response = await post<ResponsibleRequest, ResponsibleResponse>(API_URL, responsibleData);
  return response;
};

// Legacy method - kept for backward compatibility
export const createParent = async (parentData: IResponsible): Promise<IResponsible> => {
  const response = await post<IResponsible, IResponsible>(API_URL, parentData);
  return response;
};

/**
 * Get responsible by ID
 * @param id Responsible ID
 * @returns Responsible response
 */
export const getResponsibleById = async (id: string): Promise<ResponsibleResponse> => {
  const response = await get<ResponsibleResponse>(`${API_URL}/${id}`);
  return response;
};

// Legacy method - kept for backward compatibility
export const fetchParentById = async (id: string): Promise<IResponsible> => {
  const response = await get<IResponsible>(`${API_URL}/${id}`);
  return response;
};

/**
 * Update responsible
 * @param id Responsible ID
 * @param responsibleData Responsible request data
 * @returns Responsible response
 */
export const updateResponsible = async (id: string, responsibleData: ResponsibleRequest): Promise<ResponsibleResponse> => {
  return await axiosPut<ResponsibleRequest, ResponsibleResponse>(`${API_URL}/${id}`, responsibleData);
};

// Legacy method - kept for backward compatibility
export const updateParent = async (id: string, parentData: Partial<IResponsible>): Promise<Partial<IResponsible>> => {
  return await axiosPut<Partial<IResponsible>, IResponsible>(`${API_URL}/${id}`, parentData);
};

/**
 * Delete responsible
 * @param id Responsible ID
 * @returns No content
 */
export const deleteResponsible = async (id: string): Promise<void> => {
  await axiosDelete(`${API_URL}/${id}`);
};

// Legacy method - kept for backward compatibility
export const deleteParent = async (id: string) => {
  return await axiosDelete(`${API_URL}/${id}`);
};

/**
 * Get students by responsible ID
 * @param responsibleId Responsible ID
 * @param pageable Pagination parameters
 * @returns Page of student responses
 */
export const getStudentsByResponsibleId = async (responsibleId: string, pageable: { page: number, size: number, sort?: string[] }) => {
  const response = await get(`${API_URL}/${responsibleId}/students`, { params: pageable });
  return response;
};
