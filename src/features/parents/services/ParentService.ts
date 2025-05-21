import { axiosDelete, axiosPut, get, post } from '../../../config/axios';
import { PageResponse } from '../../../types/PageResponse';
import { ResponsibleRequest, ResponsibleResponse } from '../types/ResponsibleTypes';
import { StudentResponse } from '../../students/types/StudentTypes.ts';

const API_URL = '/responsibles';

/**
 * Get all responsibles
 * @param pageable Pagination parameters
 * @returns Page of responsible responses
 */
export const getAllResponsibles = async (pageable: { page: number, size: number, sort?: string }): Promise<PageResponse<ResponsibleResponse>> => {
  const response = await get<PageResponse<ResponsibleResponse>>(API_URL, { params: pageable });
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

/**
 * Get responsible by ID
 * @param id Responsible ID
 * @returns Responsible response
 */
export const fetchParentById = async (id: string): Promise<ResponsibleResponse> => {
  return get<ResponsibleResponse>(`${API_URL}/${id}`);
};

/**
 * Update responsible
 * @param id Responsible ID
 * @param responsibleData Responsible request data
 * @returns Responsible response
 */
export const updateResponsible = async (id: string, responsibleData: Partial<ResponsibleRequest>): Promise<Partial<ResponsibleResponse>> => {
  return await axiosPut<Partial<ResponsibleRequest>, ResponsibleResponse>(`${API_URL}/${id}`, responsibleData);
};

/**
 * Delete responsible
 * @param id Responsible ID
 * @returns No content
 */
export const deleteResponsible = async (id: string): Promise<void> => {
  await axiosDelete(`${API_URL}/${id}`);
};
/**
 * Get students by responsible ID
 * @param responsibleId Responsible ID
 * @param pageable Pagination parameters
 * @returns Page of student responses
 */
export const getStudentsByResponsibleId = async (responsibleId: string, pageable: { page: number, size: number, sort?: string[] }): Promise<PageResponse<StudentResponse>> => {
  return await get<PageResponse<StudentResponse>>(`${API_URL}/${responsibleId}/students`, { params: pageable });
};
