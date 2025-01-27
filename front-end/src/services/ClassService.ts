// filepath: /e:/IdeaProjects/school-control/frontend/src/services/ClassService.ts
import { get } from '@config/axios/get';
import { post } from '@config/axios/post';

export const fetchClasses = async () => {
  const response = await get('/classes');
  return response;
};

export const addClass = async (classData: any) => {
  const response = await post('/classes', classData);
  return response;
};

export const fetchClassById = async (id: string) => {
  const response = await get(`/classes/${id}`);
  return response;
};