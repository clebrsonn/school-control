import { Router } from "express";
import {
    createEnrollmentController,
    getAllEnrollmentsController,
    getEnrollmentByIdController,
    updateEnrollmentByIdController,
    deleteEnrollmentByIdController, getEnrollmentsByStudentIdController,
} from "../controllers/EnrollmentsController";

const router = Router();

router.post("/", createEnrollmentController); // Criar
router.get("/", getAllEnrollmentsController); // Buscar todos
router.get("/:id", getEnrollmentByIdController); // Buscar por ID
router.put("/:id", updateEnrollmentByIdController); // Atualizar por ID
router.delete("/:id", deleteEnrollmentByIdController); // Deletar por ID
router.get("/student/:studentId", getEnrollmentsByStudentIdController);

export default router;