import { axiosDelete, axiosPut, get, post } from '../../../config/axios';
import { UserRequest, UserResponse } from '../types/UserTypes';
import { PageResponse } from '../../../types/PageResponse';
import { IUser } from '@hyteck/shared';

const API_URL = '/users';

/**
 * Get all users
 * @param pageable Pagination parameters
 * @returns Page of user responses
 */
export const getAllUsers = async (pageable: { page: number, size: number, sort?: string[] }): Promise<PageResponse<UserResponse>> => {
  const response = await get<PageResponse<UserResponse>>(API_URL, { params: pageable });
  return response;
};

/**
 * Create user
 * @param userData User request data
 * @returns User response
 */
export const createUser = async (userData: UserRequest): Promise<UserResponse> => {
  const response = await post<UserRequest, UserResponse>(API_URL, userData);
  return response;
};

/**
 * Get user by ID
 * @param id User ID
 * @returns User response
 */
export const getUserById = async (id: string): Promise<UserResponse> => {
  const response = await get<UserResponse>(`${API_URL}/${id}`);
  return response;
};

/**
 * Update user
 * @param id User ID
 * @param userData User request data
 * @returns User response
 */
export const updateUser = async (id: string, userData: UserRequest): Promise<UserResponse> => {
  const response = await axiosPut<UserRequest, UserResponse>(`${API_URL}/${id}`, userData);
  return response;
};

/**
 * Delete user
 * @param id User ID
 * @returns No content
 */
export const deleteUser = async (id: string): Promise<void> => {
  await axiosDelete(`${API_URL}/${id}`);
};

/**
 * Get current user
 * @returns User response
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await get<UserResponse>(`${API_URL}/me`);
  return response;
};

// Legacy method - kept for backward compatibility
export const me = async (): Promise<Partial<IUser>> => {
  return await get<Partial<IUser>>(`${API_URL}/me`);
};