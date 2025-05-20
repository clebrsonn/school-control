import { IResponsible } from '@hyteck/shared';
import { axiosDelete } from '../../../config/axios/delete.ts';
import { get } from '../../../config/axios/get.ts';
import { post } from '../../../config/axios/post.ts';
import { axiosPut } from '../../../config/axios/put.ts';

export const fetchParents = async () => {
  const response = await get<IResponsible[]>('/parents');
  return response;
};

export const createParent = async (parentData: IResponsible): Promise<IResponsible> => {
  const response = await post<IResponsible, IResponsible>('/parents', parentData);
  return response;
};

export const fetchParentById = async (id: string): Promise<IResponsible> => {
  const response = await get<IResponsible>(`/parents/${id}`);
  return response;
};

export const updateParent = async (id: string, parentData: Partial<IResponsible>): Promise<IResponsible> => {
  const response = await axiosPut<Partial<IResponsible>, IResponsible>(`/parents/${id}`, parentData);
  return response;
};

export const deleteParent = async (id: string) => {
  return await axiosDelete(`/parents/${id}`);
};