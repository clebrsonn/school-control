import { axiosDelete, axiosPut, get, post } from '../../../config/axios';
import { PageResponse } from '../../../types/PageResponse';
import { ClassRoomRequest, ClassRoomResponse } from '../types/ClassRoomTypes';

const API_URL='/classrooms';

/**
 * Get all classrooms
 * @param pageable Pagination parameters
 * @returns Page of classroom responses
 */
export const getAllClassRooms = async (pageable: { page: number, size: number, sort?: string[] }): Promise<PageResponse<ClassRoomResponse>> => {
  const response = await get<PageResponse<ClassRoomResponse>>(API_URL, { params: pageable });
  return response;
};

/**
 * Create classroom
 * @param classRoomData Classroom request data
 * @returns Classroom response
 */
export const createClassRoom = async (classRoomData: ClassRoomRequest): Promise<ClassRoomResponse> => {
  const response = await post<ClassRoomRequest, ClassRoomResponse>(API_URL, classRoomData);
  return response;
};

/**
 * Get classroom by ID
 * @param id Classroom ID
 * @returns Classroom response
 */
export const getClassRoomById = async (id: string): Promise<ClassRoomResponse> => {
  const response = await get<ClassRoomResponse>(`${API_URL}/${id}`);
  return response;
};

/**
 * Update classroom
 * @param id Classroom ID
 * @param classRoomData Classroom request data
 * @returns Classroom response
 */
export const updateClassRoom = async (id: string, classRoomData: ClassRoomRequest): Promise<ClassRoomResponse> => {
  const response = await axiosPut<ClassRoomRequest, ClassRoomResponse>(`${API_URL}/${id}`, classRoomData);
  return response;
};

/**
 * Delete classroom
 * @param id Classroom ID
 * @returns No content
 */
export const deleteClassRoom = async (id: string): Promise<void> => {
  await axiosDelete(`${API_URL}/${id}`);
};