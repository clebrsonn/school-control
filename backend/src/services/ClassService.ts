// filepath: /e:/IdeaProjects/school-control/backend/src/services/ClassService.ts
import { Class, IClass, Student } from '@hyteck/shared';
export const createClass = async (data: IClass) => {
  const classInstance = new Class(data);
  return await classInstance.save();
};

export const getClasses = async () => {
  return Class.find();
};

export const getClassById = async (id: string): Promise<IClass| null> => {
  return Class.findById(id);
};