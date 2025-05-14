import { axiosPut, get, post } from '../../../config/axios';
import { INotification } from '../types/Notification.ts';
import { PageResponse } from '../../../types/PageResponse.ts';

const API_URL = '/notifications';

/**
 * Get all notifications for the current user with pagination
 * @param page Current page number
 * @param size Number of items per page
 * @returns Paginated list of notifications
 */
export const getNotifications = async (page: number = 1, size: number = 10): Promise<PageResponse<INotification>> => {
  return await get<PageResponse<INotification>>(`${API_URL}?page=${page}&size=${size}`);
};

/**
 * Get unread notifications count for the current user
 * @returns Number of unread notifications
 */
export const getUnreadNotificationsCount = async (): Promise<{ count: number }> => {
  return await get<{ count: number }>(`${API_URL}/unread/count`);
};

/**
 * Mark a notification as read
 * @param id Notification ID
 * @returns Updated notification
 */
export const markNotificationAsRead = async (id: string): Promise<INotification> => {
  return await axiosPut<unknown, INotification>(`${API_URL}/${id}/read`, {});
};

/**
 * Mark all notifications as read
 * @returns Success message
 */
export const markAllNotificationsAsRead = async (): Promise<string> => {
  return await post<unknown, string>(`${API_URL}/read-all`, {});
};
