import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from '../axiosConfig';
import notification from '../../components/common/Notification.tsx';

/**
 * Sends a DELETE request to the specified URL using axiosInstance.
 * @template TResponse The expected response type.
 * @param {string} url The URL to send the request to.
 * @param {AxiosRequestConfig} [config] The optional request configuration.
 * @returns {Promise<TResponse>} A promise that resolves with the response data.
 * @throws {AxiosError} If the request fails.
 */
export const axiosDelete = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  try {
    const response = await axiosInstance.delete<TResponse>(url, config);

    return response.data;
  } catch (error) {
    const message = (error as AxiosError<{ message: string }>).response?.data
      ?.message;

    notification(`Error while deleting ${url}. ${message ?? ''}`, 'error');

    throw error;
  }
};