// filepath: /e:/IdeaProjects/school-control/backend/src/controllers/StudentsController.ts
import {NextFunction, Request, Response} from 'express';
import {StudentService} from '../services/StudentService';
import {IEnrollment, IStudent} from "@hyteck/shared";
import {BaseController} from "./generics/BaseController";

const studentService = new StudentService();

export class StudentController extends BaseController<IStudent> {
    constructor() {
        super(studentService);
    }

    fetchStudentsByParentId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const students = await studentService.getStudentsByParentId(req.params.parentId);
            res.status(200).send(students);
        } catch (error: any) {
            next(error)
        }
    };

    enrollStudant = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const enrollment = await studentService.enrollStudent(req.params.id, req.body as Partial<IEnrollment> & {enrollmentFee: number, monthlyFee: number});
          res.status(201).send(enrollment);
      } catch (error: any) {
          next(error);
      }
  };
}