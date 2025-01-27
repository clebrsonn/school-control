// filepath: /e:/IdeaProjects/school-control/backend/src/services/ClassService.ts
import Class, { IClass } from '../models/Class';
import Student from '../models/Student';

export const createClass = async (data: IClass) => {
  const studentExists = await Student.findById(data.studentId);
  if (!studentExists) {
    throw new Error('Student not found');
  }
  const classInstance = new Class(data);
  return await classInstance.save();
};

export const getClasses = async () => {
  return await Class.find().populate('studentId');
};