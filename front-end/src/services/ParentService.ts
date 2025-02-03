import { IResponsible } from '@hyteck/shared';
import { axiosDelete } from '../config/axios/delete';
import { get } from '../config/axios/get';
import { post } from '../config/axios/post';
import { axiosPut } from '../config/axios/put';

export const fetchParents = async () => {
  const response = await get('/parents');
  return response;
};

export const addParent = async (parentData: IResponsible): Promise<IResponsible> => {
  const response = await post<IResponsible, IResponsible>('/parents', parentData);
  return response;
};

export const fetchParentById = async (id: string): Promise<IResponsible> => {
  const response = await get<IResponsible>(`/parents/${id}`);
  return response;
};

export const updateParent = async (id: string, parentData: Partial<IResponsible>): Promise<Partial<IResponsible>> => {
  const response = await axiosPut<Partial<IResponsible>, IResponsible>(`/parents/${id}`, parentData);
  return response;
};

export const deleteParent = async (id: string) => {
  const response = await axiosDelete(`/parents/${id}`);
  return response;
};