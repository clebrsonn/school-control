// filepath: /e:/IdeaProjects/school-control/backend/src/services/responsavelService.ts
import { Responsible, IResponsible } from '@hyteck/shared';

export const createParent = async (data: IResponsible) => {
  const parent = new Responsible(data);
  return await parent.save();
};

export const getParents = async () => {
  return await Responsible.find();
};

export const getParentById = async (id: string) => {
  return await Responsible.findById(id);
};

export const updateParentById = async (id: string, data: Partial<IResponsible>) => {
  return await Responsible.findByIdAndUpdate(id, data, { new: true });
};

export const deleteParentById = async (id: string) => {
  return await Responsible.findByIdAndDelete(id);
};