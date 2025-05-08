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
    // Extract error message for notification
    let errorMessage = 'An error occurred';

    if (error.response?.data) {
      // If there's a specific message field, use it
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } 
      // If there's a general error field, use it
      else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      // Otherwise use the status text
      else if (error.response.statusText) {
        errorMessage = `${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show notification with the error message
    notification(errorMessage, 'error');

    // Return the original error to preserve all error data for field-specific error handling
    return Promise.reject(error);
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
