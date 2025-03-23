import {Router} from 'express';
import {ExpenseController} from '../controllers/ExpenseController';
import uploadMiddleware from "../utils/fileUpload";

const router = Router();
const controller = new ExpenseController();

// Basic CRUD routes
router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/',uploadMiddleware,  controller.createWithReceipt);
router.put('/:id',uploadMiddleware, controller.updateWithReceipt);
router.delete('/:id', controller.delete);

export const expenseRoutes = router;