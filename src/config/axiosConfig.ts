import axios from 'axios';
import notification from '../components/common/Notification.tsx';
import { extractErrorMessage } from '../utils/errorUtils.ts';

const API_URL = import.meta.env.VITE_SERVICE_URL ?? 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Unifica tratamento de erro e 401
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      // Evita redirecionamento direto, pode ser tratado via contexto
      // window.location.href = '/login';
    }
    // Usa utilitário para extrair mensagem
    const errorMessage = extractErrorMessage(error);
    notification(errorMessage, 'error');
    return Promise.reject(error);
  }
);

export default axiosInstance;
