// filepath: /e:/IdeaProjects/school-control/backend/src/services/responsavelService.ts
import Parent, { IParent } from '../models/Parent';

export const createParent = async (data: IParent) => {
  const parent = new Parent(data);
  return await parent.save();
};

export const getParents = async () => {
  return await Parent.find();
};

export const getParentById = async (id: string) => {
  return await Parent.findById(id);
};

export const updateParentById = async (id: string, data: Partial<IParent>) => {
  return await Parent.findByIdAndUpdate(id, data, { new: true });
};

export const deleteParentById = async (id: string) => {
  return await Parent.findByIdAndDelete(id);
};