// filepath: /e:/IdeaProjects/school-control/backend/src/services/StudentService.ts
import { Student, IStudent, Enrollment, IEnrollment } from '@hyteck/shared/';
import { getClassById } from './ClassService';
import mongoose, {Types} from 'mongoose';
import {createPayment} from "./PaymentService";
import {getParentById, updateParentById} from "./ParentService";

export const createStudent = async (data: IStudent) => {
  let student = new Student(data);
  const responsible=await getParentById(student.responsible as unknown as string);
  student= await student.save();
  if (responsible) {
    await updateParentById(responsible._id as string, {students: [...(responsible.students || []), student._id as Types.ObjectId]});
  }

  return student;
};

export const getStudents = async () => {
  return await Student.find();
};

export const getStudentsByParentId = async (parentId: string) => {
  return await Student.find({ responsible: parentId }).populate('responsible');
};

export const getStudentById = async (id: string) => {
  return await Student.findById(id).populate('responsible');
};

export const updateStudentById = async (id: string, data: Partial<IStudent>) => {
  return await Student.findByIdAndUpdate(id, data, { new: true });
};

export const deleteStudentById = async (id: string) => {
  return await Student.findByIdAndDelete(id);
};

export const enrollStudent = async (studentId: string, enroll: Partial<IEnrollment>) => {
  let student= Student.findById(studentId);
  if(!student){
    throw new Error('Student not found');
  }
  // const clazz= getClassById(enroll.class );
  // if(!clazz){
  //   throw new Error('Class not found');
  // }

  const enrollment: Partial<IEnrollment> = {
    student: new mongoose.Types.ObjectId(studentId),
    fee:30.0,
    ...enroll
    };

  return await createPayment(enrollment)

}