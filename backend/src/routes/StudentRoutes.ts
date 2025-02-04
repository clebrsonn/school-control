import { Router } from 'express';
import {StudentController} from "../controllers/StudentsController";

const router = Router();
const studentController = new StudentController();

router.post("/", studentController.create);
router.get("/", studentController.findAll);
router.get("/:id", studentController.findById);
router.put("/:id", studentController.update);
router.delete("/:id", studentController.delete);


router.post('/:id/enroll', studentController.enrollStudant);


// Rota para buscar estudantes por ID do responsável
router.get('/parent/:parentId', studentController.fetchStudentsByParentId);


export default router;