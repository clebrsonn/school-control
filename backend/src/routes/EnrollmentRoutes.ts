import {createBaseRouter} from "./BaseRoutes";
import {EnrollmentsController} from "../controllers/EnrollmentsController";

const enrollmentController = new EnrollmentsController();
const router =createBaseRouter(enrollmentController);

router.get("/student/:studentId", enrollmentController.findByStudentId);

export default router;