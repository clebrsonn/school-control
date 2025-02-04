// filepath: /e:/IdeaProjects/school-control/frontend/src/services/ClassService.ts
import { get } from '@config/axios/get';
import { post } from '@config/axios/post';
import { IClass } from '@hyteck/shared';
import {axiosDelete} from "../config/axios/delete.ts";

const API_URL='/classes';
export const fetchClasses = async (): Promise<IClass[]> => {
  const response = await get<IClass[]>('/classes');
  return response;
};

export const createClass = async (classData: Partial<IClass>): Promise<IClass> => {
  const response = await post<IClass>(API_URL, classData);
  return response;
};

export const fetchClassById = async (id: string): Promise<IClass> => {
  const response = await get<IClass>(`${API_URL}/${id}`);
  return response;
};

export const deleteClass = async (id: string) => {
  const response = await axiosDelete(`${API_URL}/${id}`);
  return response;
}