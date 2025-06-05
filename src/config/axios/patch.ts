import axiosInstance from '../axiosConfig.ts';

export const  patch = async <TRequest, TResponse>(url: string, data: TRequest, config = {}): Promise<TResponse> => {
  const response = await axiosInstance.patch<TResponse>(url, data, config);
  return response.data;
}

