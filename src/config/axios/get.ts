import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from '../axiosConfig.ts';

/**
 * Makes a GET request to the specified URL and returns the response data.
 * @param url - The URL to make the GET request to.
 * @param config - Optional Axios request configuration.
 * @returns A Promise that resolves to the response data.
 * @throws An error if the request fails.
 */
export const get = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  try {
    const response = await axiosInstance.get<TResponse>(url, config);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<TResponse>;

    // The global interceptor will handle the notification
    // Just re-throw the original error to preserve all error data
    throw axiosError;
  }
};
