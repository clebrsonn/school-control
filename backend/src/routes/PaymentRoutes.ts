// filepath: /e:/IdeaProjects/school-control/backend/src/routes/PaymentRoutes.ts
import { Router } from 'express';
import { addPayment, fetchPayments, fetchPaymentsByParentId, fetchPaymentById, updatePayment, deletePayment } from '../controllers/PaymentsController';

const router = Router();

router.post('/', addPayment);
router.get('/', fetchPayments);
router.get('/parent/:parentId', fetchPaymentsByParentId);
router.get('/:id', fetchPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;