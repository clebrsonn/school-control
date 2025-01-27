import { AxiosError, AxiosRequestConfig } from 'axios';
import notification from '@components/Notification';
import axiosInstance from '@config/axiosConfig';
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
    const message = (error as AxiosError<{ message: string }>).response?.data
      ?.message;

    notification(`Error while fetching ${url}. ${message ?? ''}`, 'error');

    throw error;
  }
};