import {StudentController} from "../controllers/StudentsController";
import {createBaseRouter} from "./BaseRoutes";

const studentController = new StudentController();
const router = createBaseRouter(studentController);

router.post('/:id/enroll', studentController.enrollStudant);

router.get('/parent/:parentId', studentController.fetchStudentsByParentId);

export const studentRoutes= router;