import {Tuition, ITuition, Responsible} from '@hyteck/shared';

export const createMensalidade = async (data: ITuition) => {
  const parentExists = await Responsible.findById(data.responsible);
  if (!parentExists) {
    throw new Error('Parent not found');
  }

  const mensalidade = new Tuition(data);
  return await mensalidade.save();
};

export const getMensalidadesByParentId = async (parentId: string) => {
  return await Tuition.find({ parentId }).populate('parentId');
};

export const updateMensalidadeById = async (id: string, data: Partial<ITuition>) => {
  return await Tuition.findByIdAndUpdate(id, data, { new: true }).populate('parentId');
};

export const deleteMensalidadeById = async (id: string) => {
  return await Tuition.findByIdAndDelete(id);
};