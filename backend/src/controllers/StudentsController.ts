// filepath: /e:/IdeaProjects/school-control/backend/src/controllers/StudentsController.ts
import { Request, Response } from 'express';
import {
  StudentService
} from '../services/StudentService';
import {IStudent} from "@hyteck/shared";
import {BaseController} from "./generics/BaseController";

const studentService = new StudentService();

export class StudentController extends BaseController<IStudent> {
  constructor() {
    super(studentService);
  }

   fetchStudentsByParentId = async (req: Request, res: Response) => {
    try {
      const students = await studentService.getStudentsByParentId(req.params.parentId);
      res.status(200).send(students);
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };


  enrollStudant = async (req: Request, res: Response) => {
    try {
      console.log('req.body', req.body);
      const classId = await studentService.enrollStudent(req.params.id, req.body);
      res.status(201).send(classId);
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };
}