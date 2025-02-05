// filepath: /e:/IdeaProjects/school-control/frontend/src/axiosConfig.ts
import axios from 'axios';
import dotenv from 'dotenv';
import notification from '../components/Notification';
dotenv.config();


const API_URL = process.env.SERVICE_URL ?? 'http://192.168.1.12:5000';


const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    notification(error.response?.data?.message ?? error.response?.data, 'error');
    const errorMessage = error.response ? error.response.data?.message : error;
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;