import React, { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import notification from '../common/Notification.tsx';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    updateStudent
} from '../../features/students/services/StudentService.ts';
import { fetchParents, getStudentsByResponsibleId } from '../../features/parents/services/ParentService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { getAllClassRooms } from '../../features/classes/services/ClassService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes.ts';
import { ResponsibleResponse } from '../../features/parents/types/ResponsibleTypes.ts';
import { StudentResponse } from '../../features/students/types/StudentTypes.ts';
import { UserResponse } from '../../features/users/types/UserTypes.ts';

interface StudentManagerProps {
    responsible: string | undefined;
}

interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
}

const StudentManager: React.FC<StudentManagerProps> = ({ responsible }) => {
    const [studentPage, setStudentPage] = useState<PageResponse<StudentResponse>>({
        content: [],
        pageable: { pageNumber: 0, pageSize: 10 },
        totalElements: 0,
        totalPages: 0,
        last: true,
        size: 10,
        number: 0
    });
    const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
    const [parents, setParents] = useState<ResponsibleResponse[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState<String>();
    const [classId, setClassId] = useState('');
    const [selectedResponsible, setSelectedResponsible] = useState(responsible);
    const [selectedResponsibleName, setSelectedResponsibleName] = useState('');
    const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const getStudents = async () => {
            try {
                let studentPageData;
                if (responsible) {
                    studentPageData = await getStudentsByResponsibleId(responsible, { page: currentPage, size: pageSize });
                } else {
                    studentPageData = await getAllStudents({ page: currentPage, size: pageSize });
                }
                setStudentPage(studentPageData as PageResponse<StudentResponse>);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch students');
            }
        };

        const getClasses = async () => {
            try {
                const classData = await getAllClassRooms();
                setClasses(classData.content as ClassRoomResponse[]);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch classes');
            }
        };

        const getParents = async () => {
            try {
                const parentData = await fetchParents(0, 100); // Fetch first 100 parents
                setParents(parentData.content);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch parents');
            }
        };

        getStudents();
        getClasses();
        if (!responsible) {
            getParents();
        }
    }, [responsible, currentPage, pageSize]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1); // Convert from 1-based to 0-based
    };

    useEffect(() => {
        if (selectedResponsible) {
            const parent = parents.find(p => p.id === selectedResponsible);
            if (parent) {
                setSelectedResponsibleName(parent.name);
            }
        }
    }, [selectedResponsible, parents]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setCpf();
        setClassId('');
        setSelectedResponsible(responsible || '');
        setSelectedResponsibleName('');
        setEditingStudent(null);
    };

    const handleAddOrUpdateStudent = async () => {
        try {
            let studentData: Partial<UserResponse> = {
                name: name,
                email: email,
                cpf: cpf ,
                responsibleId: responsible || selectedResponsible
            };

            // Filtra os campos que não são nulos
            studentData = Object.fromEntries(
                Object.entries(studentData).filter(([_, value]) => value !== null)
            );

            if (editingStudent) {
                // Update existing student
                 await updateStudent(editingStudent.id, studentData);

                // Refresh the student list to get the updated data
                const refreshedData = await getAllStudents({ page: currentPage, size: pageSize });
                setStudentPage(refreshedData);

                notification('Aluno atualizado com sucesso', 'success');
            } else {
                // Create new student
                await createStudent(studentData);

                // Refresh the student list to get the updated data
                const refreshedData = await getAllStudents({ page: currentPage, size: pageSize });
                setStudentPage(refreshedData);

                notification('Aluno adicionado com sucesso', 'success');
            }

            resetForm();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save student');
        }
    };

    const handleEdit = (student: StudentResponse) => {
        setEditingStudent(student);
        setName(student.name);
        setEmail(student.email || '');
        setCpf(student.cpf);
        // setClassId(student.classId || '');
        setSelectedResponsible(student.responsibleId  || '');
        setSelectedResponsibleName(student.responsibleName || '');
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteStudent(id);

            // Refresh the student list to get the updated data
            const refreshedData = await getAllStudents({ page: currentPage, size: pageSize });
            setStudentPage(refreshedData);

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
                <h3>{editingStudent ? 'Editar Aluno' : 'Adicionar Aluno'}</h3>
                <Form.Group controlId="formStudentName">
                    <Form.Label>Nome do Aluno</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome do Aluno"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formStudentEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Email do Aluno"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formStudentCpf">
                    <Form.Label>CPF</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="CPF do Aluno"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
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
                        {classes?.map((classItem) => (
                            <option key={classItem.id as string} value={classItem.id as string}>
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
                            value={selectedResponsible}
                            onChange={(e) => setSelectedResponsible(e.target.value)}
                        >
                            <option value="">Selecione um responsável</option>
                            {parents.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                )}
                <div className="mt-3 mb-3">
                    <Button variant="primary" onClick={handleAddOrUpdateStudent} className="me-2">
                        {editingStudent ? 'Atualizar' : 'Salvar'}
                    </Button>
                    {editingStudent && (
                        <Button variant="secondary" onClick={resetForm}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </Form>
            <h2>Alunos</h2>
            <ListRegistries 
                page={studentPage}
                entityName={'students'} 
                onDelete={handleDelete}
                onEdit={handleEdit}
                onPageChange={handlePageChange}
            />
        </Container>
    );
};

export default StudentManager;
