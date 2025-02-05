import {createBaseRouter} from "./BaseRoutes";
import {PaymentsController} from "../controllers/PaymentsController";

const paymentsController = new PaymentsController();
const router = createBaseRouter(paymentsController);

router.get('/parent/:parentId', paymentsController.fetchPaymentsByParentId);

export default router;