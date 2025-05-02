import React, { useEffect, useState } from 'react';
import { createClassRoom, deleteClassRoom, getAllClassRooms } from '../../features/classes/services/ClassService';
import { ClassRoomRequest, ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes';
import { Button, Container, Form } from 'react-bootstrap';
import notification from '../common/Notification.tsx';
import ListRegistries from '../common/ListRegistries.tsx';
import { PageResponse } from '../../types/PageResponse';
import { usePagination } from '../../hooks/usePagination';

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
        <Container>
            <h1>Classes</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form>
                <Form.Group controlId="formClassName">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Class Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassStartTime">
                    <Form.Label>Horário de início</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Start Time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassEndTime">
                    <Form.Label>Horário de término</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="End Time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassEnrollmentFee">
                    <Form.Label>Matrícula</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enrollment Fee"
                        value={enrollmentFee}
                        onChange={(e) => setEnrollmentFee(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassMonthlyFee">
                    <Form.Label>Mensalidade</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Monthly Fee"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                    />
                </Form.Group>
                <Button onClick={handleAddClass} className="mt-3">Add Class</Button>
            </Form>
            <h3 className="mt-4">Lista de Turmas</h3>
            <ListRegistries 
                page={classPage} 
                entityName={'classe'} 
                onDelete={handleDelete}
                onPageChange={handlePageChange}
            />
        </Container>
    );
};

export default ClassManager;
