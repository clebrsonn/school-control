import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from '../axiosConfig';

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
    const axiosError = error as AxiosError<TResponse>;

    // The global interceptor will handle the notification
    // Just re-throw the original error to preserve all error data
    throw axiosError;
  }
};
