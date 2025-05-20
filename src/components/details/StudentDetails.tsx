import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import {
    cancelEnrollment,
    enrollStudent,
    getStudentEnrollments,
    renewEnrollment
} from '../../features/enrollments/services/EnrollmentService.ts';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes';
import { EnrollmentResponse } from '../../features/enrollments/types/EnrollmentTypes';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { StudentResponse } from '../../features/students/types/StudentTypes.ts';
import { getStudentById } from '../../features/students/services/StudentService';
import { getAllClassRooms } from '../../features/classes/services/ClassService.ts';
import {
    FaCalendarAlt,
    FaChalkboardTeacher,
    FaExchangeAlt,
    FaRedo,
    FaTimesCircle,
    FaUser,
    FaUserGraduate
} from 'react-icons/fa';

const StudentDetails: React.FC = () => {
        const { id } = useParams<{ id: string }>();
        const [student, setStudent] = useState<StudentResponse | null>(null);
        const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
        const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
        const [selectedClassId, setSelectedClassId] = useState<string>('');
        const [error, setError] = useState<string | null>(null);
        const [currentDate, setCurrentDate] = useState<Date>(new Date());
        const [enrollmentFee, setEnrollmentFee] = useState<number | undefined>(undefined);
        const [monthlyFee, setMonthlyFee] = useState<number | undefined>(undefined);

        useEffect(() => {
            fetchStudentData();
            fetchClassData();
        }, [id]);

        if (!id) {
            setError('Invalid student ID.');
            return;
        }

        const fetchStudentData = async () => {
            try {
                // Fetch student and enrollment data
                const studentData = await getStudentById(id);
                setStudent(studentData);

                try {
                    const enrollmentData = await getStudentEnrollments(id);
                    setEnrollments(Array.isArray(enrollmentData) ? enrollmentData : []);
                } catch (enrollmentErr) {
                    // If there's an error fetching enrollment, it means the student doesn't have one
                    setEnrollments([]);
                }
            } catch (err: unknown) {
                setError('Failed to fetch student data.');
                console.error(err);
            }
        };

        const fetchClassData = async () => {
            try {
                const classData = await getAllClassRooms({ page: 0, size: 100 });
                setClasses(classData.content);
            } catch (err: unknown) {
                setError('Failed to fetch class data.');
                console.error(err);
            }
        };

        const handleEnroll = async () => {
            try {
                if (!selectedClassId) {
                    setError('Please select a class.');
                    return;
                }
                await enrollStudent({
                    studentId: id,
                    classRoomId: selectedClassId,
                    enrollmentFee,
                    monthyFee: monthlyFee
                });
                setError(null);
                notification('Student successfully enrolled or updated!');
                fetchStudentData(); // Refresh data after enrollment
            } catch (err: unknown) {
                setError(err.message || 'Failed to enroll student.');
            }

        };

        const handleCancelEnrollment = async (enrollmentId: string) => {
            try {
                await cancelEnrollment(enrollmentId);
                setError(null);
                notification('Enrollment successfully canceled!');
                fetchStudentData(); // Refresh data after cancellation
            } catch (err: unknown) {
                setError(err.message || 'Failed to cancel enrollment.');
            }
        };

        const handleRenewEnrollment = async (enrollmentId: string) => {
            try {
                await renewEnrollment(enrollmentId);
                setError(null);
                notification('Enrollment successfully renewed!');
                fetchStudentData(); // Refresh data after renewal
            } catch (err: unknown) {
                setError(err.message || 'Failed to renew enrollment.');
            }
        };

        if (!student) {
            return <div>Loading...</div>;
        }

        const EnrollmentForm = ({ buttonLabel }: { buttonLabel: string }) => (
            <Form>
                <Form.Group controlId="formClassSelect">
                    <Form.Label>Selecione uma Turma</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="">Selecione uma turma</option>
                        {classes.map((classOption) => (
                            <option key={classOption.id as string} value={classOption.id as string}>
                                {classOption.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="formEnrollmentFee" className="mt-3">
                    <Form.Label>Taxa de Matrícula</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Digite a taxa de matrícula"
                        value={enrollmentFee || ''}
                        onChange={(e) => setEnrollmentFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                </Form.Group>
                <Form.Group controlId="formMonthlyFee" className="mt-3">
                    <Form.Label>Mensalidade</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Digite o valor da mensalidade"
                        value={monthlyFee || ''}
                        onChange={(e) => setMonthlyFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleEnroll} className="mt-3">
                    {buttonLabel}
                </Button>
            </Form>
        );

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">
                        <FaUserGraduate className="me-2" />
                        Detalhes do Aluno
                    </h1>
                </div>

                {error && <ErrorMessage message={error} />}

                <Row className="mb-4">
                    <Col md={12}>
                        <Card className="dashboard-card border-0">
                            <Card.Body>
                                <h5 className="mb-4">Informações Pessoais</h5>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                                <FaUserGraduate className="text-info" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">Nome</div>
                                                <div className="fw-bold">{student.name}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                                <FaUser className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">Responsável</div>
                                                <div className="fw-bold">
                                                    <Link to={`/parents/${student.responsibleId}`}
                                                          className="text-decoration-none">
                                                        {student.responsibleName}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {enrollments.length > 0 ? (
                    <>
                        <Card className="dashboard-card border-0 mb-4">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaChalkboardTeacher className="me-2 text-success" />
                                    Matrícula Atual
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {enrollments.map((enroll) => (
                                    <div key={enroll.id} className="mb-4">
                                        <Row className="mb-4">
                                            <Col md={4} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                                        <FaChalkboardTeacher className="text-success" />
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">Turma Atual</div>
                                                        <div className="fw-bold">{enroll.classRoomName}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                                        <FaCalendarAlt className="text-info" />
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">Data de Matrícula</div>
                                                        <div
                                                            className="fw-bold">{new Date(enroll.enrollmentDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                                        <FaCalendarAlt className="text-warning" />
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">Data de Término</div>
                                                        <div className="fw-bold">
                                                            {enroll.endDate ? new Date(enroll.endDate).toLocaleDateString() : 'Sem data de término'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="d-flex gap-2">
                                            {enroll.endDate && new Date(enroll.endDate) <= currentDate && (
                                                <>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => handleCancelEnrollment(enroll.id!! as string)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <FaTimesCircle className="me-2" />
                                                        Cancelar Matrícula
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        onClick={() => handleRenewEnrollment(enroll.id!! as string)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <FaRedo className="me-2" />
                                                        Renovar Matrícula
                                                    </Button>
                                                </>
                                            )}
                                            {(!enroll.endDate || new Date(enroll.endDate) > currentDate) && (
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleCancelEnrollment(enroll.id!! as string)}
                                                    className="d-flex align-items-center"
                                                >
                                                    <FaTimesCircle className="me-2" />
                                                    Cancelar Matrícula
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>

                        <Card className="dashboard-card border-0">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaExchangeAlt className="me-2 text-primary" />
                                    Alterar Turma
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <EnrollmentForm buttonLabel="Alterar Turma" />
                            </Card.Body>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card className="dashboard-card border-0 mb-4">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaChalkboardTeacher className="me-2 text-info" />
                                    Matrícula
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="alert alert-info mb-0">
                                    Este aluno não está matriculado em nenhuma turma.
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="dashboard-card border-0">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaChalkboardTeacher className="me-2 text-success" />
                                    Nova Matrícula
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <EnrollmentForm buttonLabel="Matricular" />
                            </Card.Body>
                        </Card>
                    </>
                )}
            </div>
        );
    }
;

export default StudentDetails;

