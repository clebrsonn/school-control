import { Router } from 'express';
import { addParent, fetchParents, fetchParentById, updateParent, deleteParent } from '../controllers/ParentsController';

const router = Router();

// Define a rota para adicionar um novo responsável
router.post('/', addParent);

// Define a rota para buscar todos os responsáveis
router.get('/', fetchParents);

// Define a rota para buscar um responsável por ID
router.get('/:id', fetchParentById);

// Define a rota para atualizar um responsável por ID
router.put('/:id', updateParent);

// Define a rota para deletar um responsável por ID
router.delete('/:id', deleteParent);

export default router;