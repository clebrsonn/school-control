import {Router} from 'express';
import {PaymentsController} from '../controllers/PaymentsController';

const paymentsController = new PaymentsController();
const router = Router();
if (paymentsController.create) router.post("/", paymentsController.create);
if (paymentsController.update) router.put("/:id", paymentsController.update);

router.get('/parent/:parentId', paymentsController.fetchPaymentsByParentId);
router.get('/parent/debt/:parentId', paymentsController.getMonthlyDebt);
router.get('/grouped/all', paymentsController.groupPaymentsByMonthAndParent);
router.get('/late', paymentsController.getLatePayments);
router.get('/total-estimated', paymentsController.getTotalEstimatedForCurrentMonth);
router.get('/on-time-payers', paymentsController.getOnTimePayers);
router.get('/most-late-payers', paymentsController.getMostLatePayers);
router.get('/open-month', paymentsController.getOpenPaymentCurrentMonth);



router.get("/:id", paymentsController.findById);

export const paymentRoutes= router;