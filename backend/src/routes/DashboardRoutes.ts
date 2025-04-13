import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const dashboardController = new DashboardController();
const router = Router();

router.get('/', dashboardController.index);

export const dashboardRoutes = router;