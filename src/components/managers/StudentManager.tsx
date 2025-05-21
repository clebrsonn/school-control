import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import notification from '../common/Notification.tsx';
import { useCrudManager } from '../../hooks/useCrudManager';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    updateStudent
} from '../../features/students/services/StudentService.ts';
import { getAllResponsibles, getStudentsByResponsibleId } from '../../features/parents/services/ParentService.ts';
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

const StudentManager: React.FC<StudentManagerProps> = ({ responsible }) => {
    const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
    const [parents, setParents] = useState<ResponsibleResponse[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [classId, setClassId] = useState('');
    const [selectedResponsible, setSelectedResponsible] = useState(responsible);
    const [selectedResponsibleName, setSelectedResponsibleName] = useState('');
    const [enrollmentFee, setEnrollmentFee] = useState<number | undefined>(undefined);
    const [monthlyFee, setMonthlyFee] = useState<number | undefined>(undefined);
    const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const {
        pageData: studentPage,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        create,
        update,
        remove,
        refetch
    } = useCrudManager<StudentResponse, StudentRequest>({
        entityName: 'students',
        fetchPage: (page, size) => responsible
            ? getStudentsByResponsibleId(responsible, { page, size })
            : getAllStudents({ page, size, sort: 'name,responsible' }),
        createItem: createStudent,
        updateItem: updateStudent,
        deleteItem: deleteStudent
    });

    useEffect(() => {
        const getClasses = async () => {
            try {
                const classData = await getAllClassRooms();
                setClasses(classData.content as ClassRoomResponse[]);
            } catch {}
        };
        const getParents = async () => {
            try {
                const parentData = await getAllResponsibles({ page: 0, size:100, sort: 'name' });
                setParents(parentData.content);
            } catch {}
        };
        getClasses();
        if (!responsible) getParents();
    }, [responsible]);

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
        setClassId('');
        setSelectedResponsible(responsible || '');
        setSelectedResponsibleName('');
        setEnrollmentFee(undefined);
        setMonthlyFee(undefined);
        setEditingStudent(null);
    };

    const handleAddOrUpdateStudent = async () => {
        setFieldErrors({});
        setLoading(true);

        const clientErrors: Record<string, string> = {};
        if (!name) clientErrors.name = 'Nome do aluno é obrigatório';
        if (!responsible && !selectedResponsible) clientErrors.responsibleId = 'Responsável é obrigatório';
        if (!classId) clientErrors.classId = 'Turma é obrigatório';
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setLoading(false);
            return;
        }

        try {
            let studentData: StudentRequest = {
                name,
                email,
                responsibleId: (responsible || selectedResponsible) as string,
                classroom: classId,
                enrollmentFee: enrollmentFee || 0,
                monthyFee: monthlyFee || 0,
            };

            if (editingStudent) {
                await update(editingStudent.id, studentData);
                notification('Aluno atualizado com sucesso', 'success');
            } else {
                await create(studentData);
                notification('Aluno adicionado com sucesso', 'success');
            }

            resetForm();
            refetch();
        } catch (err: any) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student: StudentResponse) => {
        setEditingStudent(student);
        setName(student.name);
        setEmail(student.email || '');
        setClassId(student.classroom || '');
        setSelectedResponsible(student.responsibleId || '');
        setSelectedResponsibleName(student.responsibleName || '');
        setEnrollmentFee(student.enrollmentFee || undefined);
        setMonthlyFee(student.monthyFee || undefined);
    };

    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification('Estudante removido com sucesso.', 'success');
            refetch();
        } catch {
            notification('Erro ao remover o estudante.', 'error');
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
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formEnrollmentFee">
                                    <Form.Label>Taxa de Matrícula</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Digite a taxa de matrícula"
                                        value={enrollmentFee || ''}
                                        onChange={(e) => setEnrollmentFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        isInvalid={!!fieldErrors.enrollmentFee}
                                    />
                                    {fieldErrors.enrollmentFee && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.enrollmentFee}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formMonthlyFee">
                                    <Form.Label>Mensalidade</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Digite o valor da mensalidade"
                                        value={monthlyFee || ''}
                                        onChange={(e) => setMonthlyFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        isInvalid={!!fieldErrors.monthyFee}
                                        min={0}
                                    />
                                    {fieldErrors.monthyFee && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.monthyFee}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
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
                                        disabled={!!responsible}
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
                        page={studentPage || { content: [], number: 0, totalPages: 1, size: 10 }}
                        entityName={'students'}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default StudentManager;

