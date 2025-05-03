import { axiosPut, get, post } from '../../../config/axios';
import { INotification } from '../types/Notification.ts';

const API_URL = '/notifications';

/**
 * Get all notifications for the current user
 * @returns List of notifications
 */
export const getNotifications = async (): Promise<INotification[]> => {
  return await get<INotification[]>(`${API_URL}`);
};

/**
 * Get unread notifications count for the current user
 * @returns Number of unread notifications
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  return await get<number>(`${API_URL}/unread/count`);
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