import {IResponsible} from '@hyteck/shared';
import {axiosDelete} from '../config/axios/delete';
import {get} from '../config/axios/get';
import {post} from '../config/axios/post';
import {axiosPut} from '../config/axios/put';

export const fetchParents = async () => {
  const response = await get('/parents');
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

export const updateParent = async (id: string, parentData: Partial<IResponsible>): Promise<Partial<IResponsible>> => {
  return await axiosPut<Partial<IResponsible>, IResponsible>(`/parents/${id}`, parentData);
};

export const deleteParent = async (id: string) => {
  return await axiosDelete(`/parents/${id}`);
};