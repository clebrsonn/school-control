// filepath: /e:/IdeaProjects/school-control/backend/src/routes/ClassRoutes.ts
import { Router } from 'express';
import { addClass, fetchClasses } from '../controllers/ClassesController';

const router = Router();

router.post('/', addClass);
router.get('/', fetchClasses);

export default router;