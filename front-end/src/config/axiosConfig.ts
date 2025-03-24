import axios from 'axios';
import notification from '../components/common/Notification.tsx';

const API_URL = import.meta.env.VITE_SERVICE_URL ?? 'http://192.168.1.12:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Pegando o token do localStorage (ou use um Context)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    notification(error.response?.data?.error ?? error.response?.data, 'error');
    const errorMessage = error.response.data ? error.response.data.details?.message ||  error.response.data.message : error;
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;