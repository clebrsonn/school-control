import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
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
import { StudentRequest, StudentResponse } from '../../features/students/types/StudentTypes.ts';
import { FaList, FaSave, FaUndo, FaUserGraduate } from 'react-icons/fa';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';

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
    const [cpf, setCpf] = useState<string>();
    const [classId, setClassId] = useState('');
    const [selectedResponsible, setSelectedResponsible] = useState(responsible);
    const [selectedResponsibleName, setSelectedResponsibleName] = useState('');
    const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

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
        // Reset errors and set loading state
        setError(null);
        setFieldErrors({});
        setLoading(true);

        // Client-side validation
        const clientErrors: Record<string, string> = {};
        if (!name) clientErrors.name = "Nome do aluno é obrigatório";
        if (!email) clientErrors.email = "Email do aluno é obrigatório";
        if (!responsible && !selectedResponsible) clientErrors.responsibleId = "Responsável é obrigatório";
        if(!classId) clientErrors.classId = "Turma é obrigatório";
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setError("Por favor, corrija os erros no formulário.");
            setLoading(false);
            return;
        }

        try {
            let studentData: StudentRequest = {
                name: name,
                email: email,
                responsibleId: (responsible || selectedResponsible) as string,
                classroom: classId
            };

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
            // Extract field-specific errors
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);

            // If there are no field-specific errors, set a general error message
            if (Object.keys(errors).length === 0) {
                setError(err.message || 'Erro ao salvar aluno');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student: StudentResponse) => {
        setEditingStudent(student);
        setName(student.name);
        setEmail(student.email || '');
        setClassId(student.classroom || '');
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
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaUserGraduate className="me-2" />
                    Gerenciar Alunos
                </h1>
            </div>

            {error && <ErrorMessage message={error} />}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        {editingStudent ? 'Editar Aluno' : 'Adicionar Aluno'}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formStudentName"
                                    label="Nome do Aluno"
                                    type="text"
                                    placeholder="Nome do Aluno"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="formStudentEmail"
                                    label="Email"
                                    type="email"
                                    placeholder="Email do Aluno"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={fieldErrors.email || null}
                                    required
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formParent">
                                    <Form.Label>Responsável</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedResponsible}
                                        onChange={(e) => setSelectedResponsible(e.target.value)}
                                        isInvalid={!!fieldErrors.responsibleId}
                                    >
                                        <option value="">Selecione um responsável</option>
                                        {parents.map((parent) => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    {fieldErrors.responsibleId && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.responsibleId}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formStudentClass">
                                    <Form.Label>Turma</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={classId}
                                        onChange={(e) => setClassId(e.target.value)}
                                        isInvalid={!!fieldErrors.classId}
                                    >
                                        <option value="">Selecione uma turma</option>
                                        {classes?.map((classItem) => (
                                            <option key={classItem.id as string} value={classItem.id as string}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    {fieldErrors.classId && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.classId}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>

                        </Row>

                        <div className="d-flex mt-3">
                            <Button 
                                variant="primary" 
                                onClick={handleAddOrUpdateStudent} 
                                className="me-2 d-flex align-items-center"
                                disabled={loading}
                            >
                                <FaSave className="me-2" />
                                {loading 
                                    ? (editingStudent ? 'Atualizando...' : 'Salvando...') 
                                    : (editingStudent ? 'Atualizar' : 'Salvar')
                                }
                            </Button>
                            {editingStudent && (
                                <Button 
                                    variant="secondary" 
                                    onClick={resetForm}
                                    className="d-flex align-items-center"
                                >
                                    <FaUndo className="me-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="table-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaList className="me-2" />
                        Lista de Alunos
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries 
                        page={studentPage}
                        entityName={'students'} 
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onPageChange={handlePageChange}
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default StudentManager;
