import axios from 'axios';
import notification from '../components/Notification';

const API_URL = import.meta.env.VITE_SERVICE_URL ?? 'http://192.168.1.12:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    notification(error.response?.data?.error ?? error.response?.data, 'error');
    const errorMessage = error.response.data ? error.response.data.details?.message : error;
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;