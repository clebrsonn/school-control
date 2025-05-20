import React, { useEffect, useState } from 'react';
import {
    createResponsible,
    deleteResponsible,
    fetchParents,
    getAllResponsibles
} from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import notification from '../common/Notification.tsx';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import ListRegistries from '../common/ListRegistries.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { PageResponse } from '../../types/PageResponse';
import { usePagination } from '../../hooks/usePagination';
import { FaList, FaSave, FaUsers } from 'react-icons/fa';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';
import { ResponsibleRequest, ResponsibleResponse } from '../../features/parents/types/ResponsibleTypes.ts';

const INITIAL_PARENT_STATE: ResponsibleRequest = { name: '', phone: '', email: '' };

const ParentManager: React.FC = () => {
    const {
        currentPage,
        pageSize,
        handlePageChange,
        createEmptyPageResponse
    } = usePagination<ResponsibleResponse>();

    const [parentPage, setParentPage] = useState<PageResponse<ResponsibleResponse>>(createEmptyPageResponse());
    const [formState, setFormState] = useState(INITIAL_PARENT_STATE);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);


    // Fetch parents when the component is mounted or pagination changes
    useEffect(() => {
        const getParents = async () => {
            try {
                setLoading(true);

                const fetchedParentPage = await getAllResponsibles({ page: currentPage, size: pageSize });
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
        // Extract field-specific errors
        const errors = extractFieldErrors(err);
        setFieldErrors(errors);

        // If there are no field-specific errors, set a general error message
        if (Object.keys(errors).length === 0) {
            setError((err as Error).message || defaultMessage);
        }
        console.error(err);
    };

    const updateFormState = (field: keyof typeof formState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

   const handleAddParent = async () => {
        setError(null);
        setFieldErrors({});
        setSubmitting(true);

        const clientErrors: Record<string, string> = {};
        if (!formState.name) clientErrors.name = 'Nome do responsável é obrigatório';
        if (!formState.phone) clientErrors.phone = 'Telefone do responsável é obrigatório';

        // TODO: Validate email format if provided
        // if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
        //     clientErrors.email = 'Formato de email inválido';
        // }

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setError('Por favor, corrija os erros no formulário.');
            setSubmitting(false);
            return;
        }

        try {
            await createResponsible(formState);

            // Refresh the parent list to get the updated data
            const refreshedData = await fetchParents(currentPage, pageSize);
            setParentPage(refreshedData);

            setFormState(INITIAL_PARENT_STATE);
            setError(null);
            notification('Responsável adicionado com sucesso', 'success');
        } catch (err: unknown) {
            handleApiError(err, 'Erro ao adicionar responsável');
        } finally {
            setSubmitting(false);
        }
    };

    // Handles deleting a parent
    const handleDelete = async (id: string) => {
        try {
            await deleteResponsible(id);

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
                            <Col md={12}>
                                <FormField
                                    id="formParentName"
                                    label="Nome"
                                    type="text"
                                    placeholder="Nome do Responsável"
                                    value={formState.name || ''}
                                    onChange={(e) => updateFormState('name', e.target.value)}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>

                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formParentEmail"
                                    label="Email"
                                    type="email"
                                    placeholder="Email do Responsável"
                                    value={formState.email || ''}
                                    onChange={(e) => updateFormState('email', e.target.value)}
                                    error={fieldErrors.email || null}
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="formParentPhone"
                                    label="Telefone"
                                    type="text"
                                    placeholder="Telefone do Responsável"
                                    value={formState.phone || ''}
                                    onChange={(e) => updateFormState('phone', e.target.value)}
                                    error={fieldErrors.phone || null}
                                    required
                                />
                            </Col>
                        </Row>
                        <div className="d-flex mt-3">
                            <Button
                                variant="primary"
                                onClick={handleAddParent}
                                className="d-flex align-items-center"
                                disabled={submitting}
                            >
                                <FaSave className="me-2" />
                                {submitting ? 'Salvando...' : 'Salvar'}
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
