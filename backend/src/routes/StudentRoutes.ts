import { Router } from 'express';
import { addStudent, fetchStudents, fetchStudentsByParentId, fetchStudentById, updateStudent, deleteStudent } from '../controllers/StudentsController';

const router = Router();

// Rota para adicionar um novo estudante
router.post('/', addStudent);

// Rota para buscar todos os estudantes
router.get('/', fetchStudents);

// Rota para buscar estudantes por ID do responsável
router.get('/parent/:parentId', fetchStudentsByParentId);

// Rota para buscar um estudante por ID
router.get('/:id', fetchStudentById);

// Rota para atualizar um estudante por ID
router.put('/:id', updateStudent);

// Rota para deletar um estudante por ID
router.delete('/:id', deleteStudent);

export default router;