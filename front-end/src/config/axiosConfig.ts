import axios from 'axios';
import notification from '../components/common/Notification.tsx';

const API_URL = import.meta.env.VITE_SERVICE_URL ?? 'http://localhost:8080';

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
    notification(error ?? error.response?.data, 'error');
    const errorMessage = error ? error ||  error.response.data.message : error;
    return Promise.reject(new Error(errorMessage));
  }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
