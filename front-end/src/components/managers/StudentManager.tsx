import React, { useEffect, useState, useMemo } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { IClass, IResponsible, IStudent } from '@hyteck/shared';
import notification from '../common/Notification.tsx';
import {
    createStudent,
    deleteStudent,
    fetchStudents,
    fetchStudentsByParentId
} from '../../features/students/services/StudentService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { fetchClasses } from '../../features/classes/services/ClassService.ts';
import { fetchParents } from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import EditStudentModal from '../modals/EditStudentModal'; // Added import

interface StudentManagerProps {
    responsible: string | undefined;
}

const StudentManager: React.FC<StudentManagerProps> = ({ responsible }) => {
    const [students, setStudents] = useState<IStudent[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [parents, setParents] = useState<IResponsible[]>([]);
    const [name, setName] = useState('');
    const [classId, setClassId] = useState('');
    const [selectedResponsible, setSelectedResponsible] = useState(responsible);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleStudentUpdated = (updatedStudent: IStudent) => {
        setStudents(prevStudents =>
            prevStudents.map(s => (s._id === updatedStudent._id ? updatedStudent : s))
        );
        setShowEditModal(false);
        setEditingStudent(null);
    };

    useEffect(() => {
        const getStudents = async () => {
            try {
                let students: IStudent[] = [];
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

        const getParents = async () => {
            try {
                const parentData = await fetchParents();
                setParents(parentData);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch parents');
            }
        };

        getStudents();
        getClasses();
        if (!responsible) {
            getParents();
        }
    }, [responsible]);

    const handleAddStudent = async () => {
        try {
            const newStudent: IStudent = { name: name || '', responsible: responsible || selectedResponsible || '', classId: classId || '' };
            const addedStudent: IStudent = await createStudent(newStudent);
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

    const handleEditStudent = (id: string) => {
        const studentToEdit = students.find(s => s._id === id);
        if (studentToEdit) {
            setEditingStudent(studentToEdit);
            setShowEditModal(true);
            // notification(`Editing student: ${studentToEdit.name}`, 'info'); // Removed placeholder notification
        }
    };

    const filteredStudents = useMemo(() => {
        if (!searchTerm) {
            return students;
        }
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

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
                            <option key={classItem._id as string} value={classItem._id as string}>
                                {classItem.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                {!responsible && (
                    <Form.Group controlId="formParent">
                        <Form.Label>Responsável</Form.Label>
                        <Form.Control
                            as="select"
                            value={responsible}
                            onChange={(e) => setSelectedResponsible(e.target.value)}
                        >
                            <option value="">Selecione um responsável</option>
                            {parents.map((parent) => (
                                <option key={parent._id} value={parent._id}>
                                    {parent.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                )}
                <Button variant="primary" onClick={handleAddStudent}>
                    Salvar
                </Button>
            </Form>
            <h2>Alunos</h2>
            <Form.Group controlId="formStudentSearch">
                <Form.Label>Buscar Aluno</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Digite o nome para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-3"
                />
            </Form.Group>
            <ListRegistries data={filteredStudents} entityName={'student'} onDelete={handleDelete} onEdit={handleEditStudent} />

            {editingStudent && (
                <EditStudentModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingStudent(null);
                    }}
                    student={editingStudent}
                    onStudentUpdated={handleStudentUpdated}
                />
            )}
        </Container>
    );
};

export default StudentManager;