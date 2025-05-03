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
        try {
            const newClass: ClassRoomRequest = {
                name,
                schoolYear: new Date().getFullYear().toString() // Use current year as school year
            };
            await createClassRoom(newClass);

            // Refresh the class list to get the updated data
            const refreshedData = await getAllClassRooms({ page: currentPage, size: pageSize });
            setClassPage(refreshedData);

            setName('');
            setStartTime('');
            setEndTime('');
            setEnrollmentFee('');
            setMonthlyFee('');
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to add class');
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
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formClassName">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nome da Turma"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formClassStartTime">
                                    <Form.Label>Horário de início</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Horário de início"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="formClassEndTime">
                                    <Form.Label>Horário de término</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Horário de término"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="formClassEnrollmentFee">
                                    <Form.Label>Matrícula</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Valor da matrícula"
                                        value={enrollmentFee}
                                        onChange={(e) => setEnrollmentFee(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="formClassMonthlyFee">
                                    <Form.Label>Mensalidade</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Valor da mensalidade"
                                        value={monthlyFee}
                                        onChange={(e) => setMonthlyFee(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex mt-3">
                            <Button 
                                variant="primary" 
                                onClick={handleAddClass} 
                                className="d-flex align-items-center"
                            >
                                <FaSave className="me-2" />
                                Salvar
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
