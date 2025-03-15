import {createBaseRouter} from "./BaseRoutes";
import {EnrollmentsController} from "../controllers/EnrollmentsController";

const enrollmentController = new EnrollmentsController();
const router = createBaseRouter(enrollmentController);

router.get("/student/:studentId", enrollmentController.findByStudentId);
router.put("/:id/cancel", enrollmentController.cancelEnrollment);
router.put("/:id/renew", enrollmentController.renewEnrollment);

export const enrollmentRoutes = router;