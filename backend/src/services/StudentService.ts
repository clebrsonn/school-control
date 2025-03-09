// filepath: /e:/IdeaProjects/school-control/backend/src/services/StudentService.ts
import {IEnrollment, IStudent, Student} from '@hyteck/shared/';
import mongoose, {Types} from 'mongoose';
import {ParentService} from "./ParentService";
import {BaseService} from "./generics/BaseService";
import {EnrollmentService} from "./EnrollmentService";

export class StudentService extends BaseService<IStudent> {
  parentService = new ParentService();
  enrollmentService = new EnrollmentService();
  constructor() {
    super(Student);
    this.populateFields=['responsible'];
    this.sortFields={name:1};
  }



  create= async (data: IStudent) => {
    let student = new Student(data);
    const responsible=await this.parentService.findById(student.responsible as unknown as string);
    student= await student.save();
    if (responsible) {
      await this.parentService.update(responsible._id as string, {students: [...(responsible.students || []), student._id as Types.ObjectId]});
    }
    await this.enrollStudent(student._id as string, {classId: data.classId as unknown as Types.ObjectId});


    return student;
  };


  getStudentsByParentId = async (parentId: string) => {
    return await Student.find({ responsible: parentId }).populate('responsible').sort({ name: 1 });
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

    return await this.enrollmentService.create(enrollment)

  }

}