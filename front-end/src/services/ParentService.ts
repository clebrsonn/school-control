import { axiosDelete } from '../config/axios/delete';
import { get } from '../config/axios/get';
import { post } from '../config/axios/post';
import { axiosPut } from '../config/axios/put';

export const fetchParents = async () => {
  const response = await get('/parents');
  return response;
};

export const addParent = async (parentData: any) => {
  const response = await post('/parents', parentData);
  return response;
};

export const fetchParentById = async (id: string) => {
  const response = await get(`/parents/${id}`);
  return response;
};

export const updateParent = async (id: string, parentData: any) => {
  const response = await axiosPut(`/parents/${id}`, parentData);
  return response;
};

export const deleteParent = async (id: string) => {
  const response = await axiosDelete(`/parents/${id}`);
  return response;
};