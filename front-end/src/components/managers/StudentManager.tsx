import React, { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { IClass, IStudent } from '@hyteck/shared';
import notification from '../common/Notification.tsx';
import {
    createStudent,
    deleteStudent,
    fetchStudents,
    fetchStudentsByParentId
} from '../../features/students/services/StudentService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { fetchClasses } from '../../features/classes/services/ClassService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';

interface StudentManagerProps {
    responsible: string | undefined;
}

const StudentManager: React.FC<StudentManagerProps> = ({ responsible }) => {
    const [students, setStudents] = useState<IStudent[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [name, setName] = useState('');
    const [classId, setClassId] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getStudents = async () => {
            try {
                let students;
                if (responsible) {
                    students = await fetchStudentsByParentId(responsible);
                } else {
                    students = await fetchStudents();
                }
                setStudents(students);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch students');
            }
        };

        const getClasses = async () => {
            try {
                const classData = await fetchClasses();
                setClasses(classData);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch classes');
            }
        };

        getStudents();
        getClasses();
    }, [responsible]);

    const handleAddStudent = async () => {
        try {
            const newStudent: Partial<IStudent> = { name, responsible, classId };
            const addedStudent = await createStudent(newStudent);
            setStudents([...students, addedStudent]);
            setName('');
            setClassId('');
            setError(null);
            notification('Aluno adicionado com sucesso', 'success');
        } catch (err: any) {
            setError(err.message || 'Failed to add student');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteStudent(id);
            setStudents(students.filter((student) => student._id !== id));
            notification('Estudante removido com sucesso.', 'success');
        } catch {
            setError('Erro ao remover o estudante.');
        }
    };


    return (
        <Container>
            <h1>Gerenciar Alunos</h1>
            {error && <ErrorMessage message={error} />}
            <Form>
                <Form.Group controlId="formStudentName">
                    <Form.Label>Nome do Aluno</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome do Aluno"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formStudentClass">
                    <Form.Label>Turma</Form.Label>
                    <Form.Control
                        as="select"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                    >
                        <option value="">Selecione uma turma</option>
                        {classes.map((classItem) => (
                            <option key={classItem._id} value={classItem._id}>
                                {classItem.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Button variant="primary" onClick={handleAddStudent}>
                    Salvar
                </Button>
            </Form>
            <h2>Alunos</h2>
            <ListRegistries data={students} entityName={'student'} onDelete={handleDelete}></ListRegistries>

        </Container>
    );
};

export default StudentManager;