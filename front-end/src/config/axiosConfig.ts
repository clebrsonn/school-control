// filepath: /e:/IdeaProjects/school-control/frontend/src/axiosConfig.ts
import axios from 'axios';
import notification from '../components/Notification';

const API_URL = import.meta.env.SERVICE_URL ?? 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    notification(error.response?.data?.message ?? error.response?.data, 'error');
    const errorMessage = error.response ? error.response.data?.message : 'Network Error';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;