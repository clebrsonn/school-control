import {createBaseRouter} from "./BaseRoutes";
import {EnrollmentsController} from "../controllers/EnrollmentsController";

const enrollmentController = new EnrollmentsController();
const router =createBaseRouter(enrollmentController);

router.get("/student/:studentId", enrollmentController.findByStudentId);
router.get("/cancel/:id", enrollmentController.cancelEnrollment);
router.get("/renew/:id", enrollmentController.renewEnrollment);

export const enrollmentRoutes= router;