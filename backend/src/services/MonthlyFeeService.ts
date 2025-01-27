import Mensalidade, { IMensalidade } from '../models/MonthyFee';
import Parent from '../models/Parent';

export const createMensalidade = async (data: IMensalidade) => {
  const parentExists = await Parent.findById(data.parentId);
  if (!parentExists) {
    throw new Error('Parent not found');
  }

  const mensalidade = new Mensalidade(data);
  return await mensalidade.save();
};

export const getMensalidadesByParentId = async (parentId: string) => {
  return await Mensalidade.find({ parentId }).populate('parentId');
};

export const updateMensalidadeById = async (id: string, data: Partial<IMensalidade>) => {
  return await Mensalidade.findByIdAndUpdate(id, data, { new: true }).populate('parentId');
};

export const deleteMensalidadeById = async (id: string) => {
  return await Mensalidade.findByIdAndDelete(id);
};