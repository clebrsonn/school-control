import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from '../axiosConfig';
import notification from '../../components/Notification';

/**
 * Sends a POST request to the specified URL with the given data and configuration.
 * @template TRequest The type of the request data.
 * @template TResponse The type of the response data.
 * @param {string} url The URL to send the request to.
 * @param {TRequest} data The data to send with the request.
 * @param {AxiosRequestConfig} [config] The configuration for the request.
 * @returns {Promise<TResponse>} A promise that resolves with the response data.
 * @throws {AxiosError} If the request fails.
 */
export const post = async <TRequest, TResponse>(
  url: string,
  data: TRequest,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  try {
    const response = await axiosInstance.post<TResponse>(url, data, config);

    return response.data;
  } catch (error) {
    const message = (error as AxiosError<{ message: string }>).response?.data
      ?.message;

    notification(`Error while posting ${url}. ${message ?? ''}`, 'error');

    throw error;
  }
};