import {NextFunction, Request, Response} from "express";
import {EnrollmentService} from "../services/EnrollmentService";
import {BaseController} from "./generics/BaseController";
import {IEnrollment} from "@hyteck/shared";

const enrollmentService= new EnrollmentService();

export class EnrollmentsController extends BaseController<IEnrollment>{
    constructor() {
        super(enrollmentService);
    }

    findByStudentId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { studentId } = req.params;
            const enrollments = await enrollmentService.getEnrollmentsByStudentId(studentId);
            if (enrollments.length === 0) {
                res.status(404).json({ error: "No enrollments found for the specified student" });
                return;
            }
            res.status(200).json(enrollments);
        } catch (error: any) {
            next(error)
        }
    };

    cancelEnrollment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const enrollments = await enrollmentService.cancelEnrollment(id);
            res.json(enrollments);
        } catch (error: any) {
            next(error)
        }
    };

    renewEnrollment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const enrollments = await enrollmentService.renewEnrollment(id);
            res.json(enrollments);
        } catch (error: any) {
            next(error)
        }
    };


}