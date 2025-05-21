import React, { useState } from 'react';
import {
    createResponsible,
    deleteResponsible,
    getAllResponsibles
} from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import notification from '../common/Notification.tsx';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import ListRegistries from '../common/ListRegistries.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { ResponsibleRequest, ResponsibleResponse } from '../../features/parents/types/ResponsibleTypes.ts';
import { useCrudManager } from '../../hooks/useCrudManager';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';
import { FaList, FaSave, FaUsers } from 'react-icons/fa';

const INITIAL_PARENT_STATE: ResponsibleRequest = { name: '', phone: '', email: '' };

const ParentManager: React.FC = () => {
    const {
        pageData,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        create,
        remove,
        refetch
    } = useCrudManager<ResponsibleResponse, ResponsibleRequest>({
        entityName: 'parents',
        fetchPage: (page, size) => getAllResponsibles({ page, size }),
        createItem: createResponsible,
        deleteItem: deleteResponsible
    });

    const [formState, setFormState] = useState(INITIAL_PARENT_STATE);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const updateFormState = (field: keyof typeof formState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddParent = async () => {
        setFieldErrors({});
        setSubmitting(true);

        const clientErrors: Record<string, string> = {};
        if (!formState.name) clientErrors.name = 'Nome do responsável é obrigatório';
        if (!formState.phone) clientErrors.phone = 'Telefone do responsável é obrigatório';

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setSubmitting(false);
            return;
        }

        try {
            await create(formState);
            setFormState(INITIAL_PARENT_STATE);
            notification('Responsável adicionado com sucesso', 'success');
            refetch();
        } catch (err: unknown) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification('Responsável removido com sucesso.', 'success');
            refetch();
        } catch (err: unknown) {
            notification('Erro ao remover o responsável.', 'error');
        }
    };

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
                        page={pageData || { content: [], number: 0, totalPages: 1, size: 10 }}
                        entityName="parents"
                        onDelete={handleDelete}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default ParentManager;
