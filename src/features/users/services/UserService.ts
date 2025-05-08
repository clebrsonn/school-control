import { axiosPut, get } from '../../../config/axios';
import { IUser } from '@hyteck/shared';

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
export const updateUserProfile = async (userData: UserProfileUpdateData): Promise<Partial<IUser>> => {
  return await axiosPut<UserProfileUpdateData, Partial<IUser>>('/users/profile', userData);
};

/**
 * Get user profile
 * @returns User profile data
 */
export const getUserProfile = async (): Promise<Partial<IUser>> => {
  return await get<Partial<IUser>>('/users/profile');
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