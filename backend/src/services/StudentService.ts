// filepath: /e:/IdeaProjects/school-control/backend/src/services/StudentService.ts
import { Student, IStudent, Enrollment, IEnrollment } from '@hyteck/shared/';
import { getClassById } from './ClassService';
import mongoose, {Types} from 'mongoose';
import {createPayment} from "./PaymentService";
import {getParentById, updateParentById} from "./ParentService";
import {BaseService} from "./generics/BaseService";

export class StudentService extends BaseService<IStudent> {
  constructor() {
    super(Student);
  }

  create= async (data: IStudent) => {
    let student = new Student(data);
    const responsible=await getParentById(student.responsible as unknown as string);
    student= await student.save();
    if (responsible) {
      await updateParentById(responsible._id as string, {students: [...(responsible.students || []), student._id as Types.ObjectId]});
    }
    await this.enrollStudent(student._id as string, {classId: data.classId as unknown as Types.ObjectId});


    return student;
  };


  getStudentsByParentId = async (parentId: string) => {
    return await Student.find({ responsible: parentId }).populate('responsible');
  };

  findById = async (id: string) => {
    return await Student.findById(id).populate('responsible');
  };

  enrollStudent = async (studentId: string, enroll: Partial<IEnrollment>) => {
    let student= Student.findById(studentId);
    if(!student){
      throw new Error('Student not found');
    }

    const enrollment: Partial<IEnrollment> = {
      student: new mongoose.Types.ObjectId(studentId),
      fee:30.0,
      ...enroll
    };

    return await createPayment(enrollment)

  }

}