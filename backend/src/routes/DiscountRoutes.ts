// filepath: /e:/IdeaProjects/school-control/backend/src/routes/DiscountRoutes.ts
import { Router } from 'express';
import { addDiscount, fetchDiscounts } from '../controllers/DiscountsController';

const router = Router();

router.post('/', addDiscount);
router.get('/', fetchDiscounts);

export default router;