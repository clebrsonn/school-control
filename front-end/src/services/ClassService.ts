// filepath: /e:/IdeaProjects/school-control/frontend/src/services/ClassService.ts
import { get } from '@config/axios/get';
import { post } from '@config/axios/post';
import { IClass } from '@hyteck/shared';

const API_URL='/classes';
export const fetchClasses = async (): Promise<IClass[]> => {
  const response = await get<IClass[]>('/classes');
  return response;
};

export const addClass = async (classData: Partial<IClass>): Promise<IClass> => {
  const response = await post<IClass>(API_URL, classData);
  return response;
};

export const fetchClassById = async (id: string): Promise<IClass> => {
  const response = await get<IClass>(`${API_URL}/${id}`);
  return response;
};