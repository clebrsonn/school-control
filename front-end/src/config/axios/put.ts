import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from '@config/axiosConfig';
import notification from '@components/Notification';

/**
 * Sends a PUT request to the specified URL with the provided data and configuration.
 * @template TRequest The type of the request data.
 * @template TResponse The type of the response data.
 * @param {string} url The URL to send the request to.
 * @param {TRequest} data The data to send with the request.
 * @param {AxiosRequestConfig} [config] The configuration for the request.
 * @returns {Promise<TResponse>} A promise that resolves with the response data.
 * @throws {AxiosError} If the request fails.
 */
export const axiosPut = async <TRequest, TResponse>(
  url: string,
  data: TRequest,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  try {
    const response = await axiosInstance.put<TResponse>(url, data, config);

    return response.data;
  } catch (error) {
    const message = (error as AxiosError<{ message: string }>).response?.data
      ?.message;

    notification(`Error while updating ${url}. ${message ?? ''}`, 'error');
    throw error;
  }
};
