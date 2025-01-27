import { axiosDelete } from "../config/axios/delete";
import { get } from "../config/axios/get";
import { post } from "../config/axios/post";
import { axiosPut } from "../config/axios/put";

export const fetchMonthlyFeesByParentId = async (parentId: string) => {
  const response = await get(`/mensalidades/parent/${parentId}`);
  return response;
};

export const addMonthlyFee = async (mensalidadeData: any) => {
  const response = await post('/mensalidades', mensalidadeData);
  return response;
};

export const updateMensalidade = async (id: string, mensalidadeData: any) => {
  const response = await axiosPut(`/mensalidades/${id}`, mensalidadeData);
  return response;
};

export const deleteMensalidade = async (id: string) => {
  const response = await axiosDelete(`/mensalidades/${id}`);
  return response;
};