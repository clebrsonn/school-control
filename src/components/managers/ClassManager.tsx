import React, { useEffect, useState } from 'react';
import { createClassRoom, deleteClassRoom, getAllClassRooms } from '../../features/classes/services/ClassService';
import { ClassRoomRequest, ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import notification from '../common/Notification.tsx';
import ListRegistries from '../common/ListRegistries.tsx';
import { PageResponse } from '../../types/PageResponse';
import { usePagination } from '../../hooks/usePagination';
import { FaChalkboardTeacher, FaList, FaSave } from 'react-icons/fa';
import ErrorMessage from '../common/ErrorMessage.tsx';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';

const ClassManager: React.FC = () => {
    const { 
        currentPage, 
        pageSize, 
        handlePageChange,
        createEmptyPageResponse
    } = usePagination<ClassRoomResponse>();

    const [classPage, setClassPage] = useState<PageResponse<ClassRoomResponse>>(createEmptyPageResponse());
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [enrollmentFee, setEnrollmentFee] = useState('');
    const [monthlyFee, setMonthlyFee] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const getClasses = async () => {
            try {
                const classData = await getAllClassRooms({ page: currentPage, size: pageSize });
                setClassPage(classData);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch classes');
            }
        };

        getClasses();
    }, [currentPage, pageSize]);

    const handleAddClass = async () => {
        // Reset errors and set loading state
        setError(null);
        setFieldErrors({});
        setLoading(true);

        // Client-side validation
        const clientErrors: Record<string, string> = {};
        if (!name) clientErrors.name = "Nome da turma é obrigatório";

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setError("Por favor, corrija os erros no formulário.");
            setLoading(false);
            return;
        }

        try {
            const newClass: ClassRoomRequest = {
                name,
                schoolYear: new Date().getFullYear().toString(),
                startTime,
                endTime
            };
            await createClassRoom(newClass);

            // Refresh the class list to get the updated data
            const refreshedData = await getAllClassRooms({ page: currentPage, size: pageSize });
            setClassPage(refreshedData);

            // Reset form
            setName('');
            setStartTime('');
            setEndTime('');
            setEnrollmentFee('');
            setMonthlyFee('');
            setError(null);

            notification('Turma adicionada com sucesso.', 'success');
        } catch (err) {
            // Extract field-specific errors
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);

            // If there are no field-specific errors, set a general error message
            if (Object.keys(errors).length === 0) {
                setError(err.message || 'Erro ao adicionar turma');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteClassRoom(id);

            // Refresh the class list to get the updated data
            const refreshedData = await getAllClassRooms({ page: currentPage, size: pageSize });
            setClassPage(refreshedData);

            notification('Turma removida com sucesso.');
        } catch {
            setError('Erro ao remover a turma.');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaChalkboardTeacher className="me-2" />
                    Gerenciar Turmas
                </h1>
            </div>

            {error && <ErrorMessage message={error} />}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Adicionar Turma</h5>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <FormField
                                    id="formClassName"
                                    label="Nome"
                                    type="text"
                                    placeholder="Nome da Turma"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formClassStartTime"
                                    label="Horário de início"
                                    type="text"
                                    placeholder="Horário de início"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    error={fieldErrors.startTime || null}
                                />
                            </Col>

                            <Col md={6}>
                                <FormField
                                    id="formClassEndTime"
                                    label="Horário de término"
                                    type="text"
                                    placeholder="Horário de término"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    error={fieldErrors.endTime || null}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formClassEnrollmentFee"
                                    label="Matrícula"
                                    type="text"
                                    placeholder="Valor da matrícula"
                                    value={enrollmentFee}
                                    onChange={(e) => setEnrollmentFee(e.target.value)}
                                    error={fieldErrors.enrollmentFee || null}
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="formClassMonthlyFee"
                                    label="Mensalidade"
                                    type="text"
                                    placeholder="Valor da mensalidade"
                                    value={monthlyFee}
                                    onChange={(e) => setMonthlyFee(e.target.value)}
                                    error={fieldErrors.monthlyFee || null}
                                />
                            </Col>
                        </Row>
                        <div className="d-flex mt-3">
                            <Button 
                                variant="primary" 
                                onClick={handleAddClass} 
                                className="d-flex align-items-center"
                                disabled={loading}
                            >
                                <FaSave className="me-2" />
                                {loading ? 'Salvando...' : 'Cadastrar'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="table-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaList className="me-2" />
                        Lista de Turmas
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries 
                        page={classPage} 
                        entityName={'classe'} 
                        onDelete={handleDelete}
                        onPageChange={handlePageChange}
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default ClassManager;
