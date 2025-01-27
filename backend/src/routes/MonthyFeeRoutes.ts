import { Router } from 'express';
import { addMensalidade, fetchMensalidadesByParentId, updateMensalidade, deleteMensalidade } from '../controllers/MonthlyFeesController';

const router = Router();

router.post('/', addMensalidade);
router.get('/parent/:parentId', fetchMensalidadesByParentId);
router.put('/:id', updateMensalidade);
router.delete('/:id', deleteMensalidade);

export default router;