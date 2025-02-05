import { Request, Response } from "express";
import { EnrollmentService } from "../services/EnrollmentService";
import {BaseController} from "./generics/BaseController";
import {IEnrollment} from "@hyteck/shared";

const enrollmentService= new EnrollmentService();

export class EnrollmentsController extends BaseController<IEnrollment>{
    constructor() {
        super(enrollmentService);
    }

    findByStudentId = async (req: Request, res: Response) => {
        try {
            const { studentId } = req.params;
            const enrollments = await enrollmentService.getEnrollmentsByStudentId(studentId);
            if (enrollments.length === 0) {
                res.status(404).json({ error: "No enrollments found for the specified student" });
                return;
            }
            res.status(200).json(enrollments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}