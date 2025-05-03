import React, { useEffect, useState } from 'react';
import { createParent, deleteParent, fetchParents } from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import notification from '../common/Notification.tsx';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { IResponsible } from '@hyteck/shared';
import ListRegistries from '../common/ListRegistries.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { PageResponse } from '../../types/PageResponse';
import { usePagination } from '../../hooks/usePagination';
import { FaList, FaSave, FaUsers } from 'react-icons/fa';

// Constants for reusable initial states
const INITIAL_PARENT_STATE: Partial<IResponsible> = { name: '', phone: '' };

const ParentManager: React.FC = () => {
    const { 
        currentPage, 
        pageSize, 
        handlePageChange,
        createEmptyPageResponse
    } = usePagination<IResponsible>();

    const [parentPage, setParentPage] = useState<PageResponse<IResponsible>>(createEmptyPageResponse());
    const [formState, setFormState] = useState(INITIAL_PARENT_STATE);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);


    // Fetch parents when the component is mounted or pagination changes
    useEffect(() => {
        const getParents = async () => {
            try {
                setLoading(true);

                const fetchedParentPage = await fetchParents(currentPage, pageSize);
                setParentPage(fetchedParentPage);
                setLoading(false);

            } catch (err: unknown) {
                handleApiError(err, 'Failed to fetch parents');
                setLoading(false);
            }
        };
        getParents();
    }, [currentPage, pageSize]);


    if (loading) {
        return <LoadingSpinner />;
    }


    // Centralized error handler for API calls
    const handleApiError = (err: unknown, defaultMessage: string) => {
        setError((err as Error).message || defaultMessage);
        console.error(err);
    };

    // Updates the form state dynamically
    const updateFormState = (field: keyof typeof formState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    // Handles adding a new parent
    const handleAddParent = async () => {
        try {
            const newParent = { ...formState, students: [] };
            await createParent(newParent);

            // Refresh the parent list to get the updated data
            const refreshedData = await fetchParents(currentPage, pageSize);
            setParentPage(refreshedData);

            setFormState(INITIAL_PARENT_STATE);
            setError(null);
            notification('Parent added successfully', 'success');
        } catch (err: unknown) {
            handleApiError(err, 'Failed to add parent');
        }
    };

    // Handles deleting a parent
    const handleDelete = async (id: string) => {
        try {
            await deleteParent(id);

            // Refresh the parent list to get the updated data
            const refreshedData = await fetchParents(currentPage, pageSize);
            setParentPage(refreshedData);

            notification('Responsável removido com sucesso.', 'success');
        } catch (err: unknown) {
            handleApiError(err, 'Erro ao remover o responsável.');
        }
    };

    if (!parentPage.content) return <LoadingSpinner />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaUsers className="me-2" />
                    Gerenciar Responsáveis
                </h1>
            </div>

            {error && <ErrorMessage message={error} />}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Adicionar Responsável</h5>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formParentName">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nome do Responsável"
                                        value={formState.name}
                                        onChange={(e) => updateFormState('name', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formParentPhone">
                                    <Form.Label>Telefone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Telefone do Responsável"
                                        value={formState.phone}
                                        onChange={(e) => updateFormState('phone', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex mt-3">
                            <Button 
                                variant="primary" 
                                onClick={handleAddParent} 
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
                        Lista de Responsáveis
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries 
                        page={parentPage} 
                        entityName="parents"
                        onDelete={handleDelete} 
                        onPageChange={handlePageChange} 
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default ParentManager;
