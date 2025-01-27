// filepath: /e:/IdeaProjects/school-control/backend/src/services/StudentService.ts
import Student, { IStudent } from '../models/Student';

export const createStudent = async (data: IStudent) => {
  const student = new Student(data);
  return await student.save();
};

export const getStudents = async () => {
  return await Student.find();
};

export const getStudentsByParentId = async (parentId: string) => {
  return await Student.find({ parentId });
};

export const getStudentById = async (id: string) => {
  return await Student.findById(id);
};

export const updateStudentById = async (id: string, data: Partial<IStudent>) => {
  return await Student.findByIdAndUpdate(id, data, { new: true });
};

export const deleteStudentById = async (id: string) => {
  return await Student.findByIdAndDelete(id);
};