import { axiosPut, get } from '../../../config/axios';
import { UserResponse } from '../types/UserTypes.ts';

interface UserProfileUpdateData {
  username?: string;
  email?: string;
  name?: string;
  phone?: string;
  bio?: string;
}

/**
 * Update user profile
 * @param userData User profile data to update
 * @returns Updated user data
 */
export const updateUserProfile = async (userData: UserProfileUpdateData): Promise<Partial<UserResponse>> => {
  return await axiosPut<UserProfileUpdateData, Partial<UserResponse>>('/users/profile', userData);
};

/**
 * Get user profile
 * @returns User profile data
 */
export const getUserProfile = async (): Promise<Partial<UserResponse>> => {
  return await get<Partial<UserResponse>>('/users/profile');
};

/**
 * Update user settings
 * @param settings User settings to update
 * @returns Updated settings
 */
export const updateUserSettings = async (settings: Record<string, any>): Promise<Record<string, any>> => {
  return await axiosPut<Record<string, any>, Record<string, any>>('/users/settings', settings);
};

/**
 * Get user settings
 * @returns User settings
 */
export const getUserSettings = async (): Promise<Record<string, any>> => {
  return await get<Record<string, any>>('/users/settings');
};