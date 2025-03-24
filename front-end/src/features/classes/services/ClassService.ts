import { axiosDelete, get, post } from '../../../config/axios';
import { IClass } from '@hyteck/shared';

const API_URL='/classes';
export const fetchClasses = async (): Promise<IClass[]> => {
  const response = await get<IClass[]>('/classes');
  return response;
};

export const createClass = async (classData: Partial<IClass>): Promise<IClass> => {
  const response = await post<Partial<IClass>, IClass>(API_URL, classData);
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