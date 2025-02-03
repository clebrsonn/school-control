import { Request, Response } from "express";
import {
    createEnrollment,
    getAllEnrollments,
    getEnrollmentById,
    updateEnrollmentById,
    deleteEnrollmentById, getEnrollmentsByStudentId,
} from "../services/EnrollmentService";

export const createEnrollmentController = async (req: Request, res: Response) => {
    try {
        const enrollment = await createEnrollment(req.body);
        res.status(201).json(enrollment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllEnrollmentsController = async (_req: Request, res: Response) => {
    try {
        const enrollments = await getAllEnrollments();
        res.status(200).json(enrollments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getEnrollmentByIdController = async (req: Request, res: Response) => {
    try {
        const enrollment = await getEnrollmentById(req.params.id);
        if (!enrollment) {
            res.status(404).json({ error: "Enrollment not found" });
            return;
        }
        res.status(200).json(enrollment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateEnrollmentByIdController = async (req: Request, res: Response) => {
    try {
        const enrollment = await updateEnrollmentById(req.params.id, req.body);
        if (!enrollment) {
            res.status(404).json({ error: "Enrollment not found" });
            return;
        }
        res.status(200).json(enrollment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteEnrollmentByIdController = async (req: Request, res: Response) => {
    try {
        const enrollment = await deleteEnrollmentById(req.params.id);
        if (!enrollment) {
            res.status(404).json({ error: "Enrollment not found" });
            return;
        }
        res.status(204).send(); // Sucesso sem corpo na resposta
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getEnrollmentsByStudentIdController = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const enrollments = await getEnrollmentsByStudentId(studentId);

        if (enrollments.length === 0) {
            res.status(404).json({ error: "No enrollments found for the specified student" });
            return;
        }

        res.status(200).json(enrollments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};