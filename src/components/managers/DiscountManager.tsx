import React, { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useCrudManager } from '../../hooks/useCrudManager';
import { createDiscount, deleteDiscount, fetchDiscounts } from '../../features/enrollments/services/DiscountService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { FaList, FaPercentage, FaSave } from 'react-icons/fa';
import ErrorMessage from '../common/ErrorMessage.tsx';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';
import { DiscountResponse } from '../../features/billing/types/Discount.ts';

const DiscountManager: React.FC = () => {
    const {
        pageData: discountPage,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        create,
        remove,
        refetch
    } = useCrudManager<DiscountResponse>({
        entityName: 'discounts',
        fetchPage: (page, size) => fetchDiscounts(page, size),
        createItem: createDiscount,
        deleteItem: deleteDiscount
    });

    const [name, setName] = useState<string>("");
    const [value, setValue] = useState<number>(0);
    const [validUntil, setValidUntil] = useState<string>("");
    const [type, setType] = useState<"MATRICULA" | "MENSALIDADE">("MATRICULA");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setLoading(true);

        const clientErrors: Record<string, string> = {};
        if (!name) clientErrors.name = "Nome do desconto é obrigatório";
        if (value <= 0) clientErrors.value = "Valor deve ser maior que zero";
        if (!validUntil) clientErrors.validUntil = "Data de validade é obrigatória";
        if (!type) clientErrors.type = "Tipo de desconto é obrigatório";

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setLoading(false);
            return;
        }

        try {
            await create({ name, value, validUntil: new Date(validUntil), type });
            setName("");
            setValue(0);
            setValidUntil("");
            setType("MATRICULA");
            notification("Desconto criado com sucesso!", "success");
            refetch();
        } catch (err: any) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification("Desconto removido com sucesso.", "success");
            refetch();
        } catch (err: any) {
            notification("Erro ao excluir o desconto.", "error");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaPercentage className="me-2" />
                    Gerenciar Descontos
                </h1>
            </div>

            {error && <ErrorMessage message={error} />}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Adicionar Desconto</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="discountName"
                                    label="Nome do Desconto"
                                    type="text"
                                    placeholder="Exemplo: Desconto para alunos novos"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="discountValue"
                                    label="Valor do Desconto"
                                    type="number"
                                    placeholder="Exemplo: 50"
                                    value={value.toString()}
                                    onChange={(e) => setValue(Number(e.target.value))}
                                    error={fieldErrors.value || null}
                                    required
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="discountValidUntil"
                                    label="Validade do Desconto"
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    error={fieldErrors.validUntil || null}
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="discountType">
                                    <Form.Label>Tipo de Desconto</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        required
                                        isInvalid={!!fieldErrors.type}
                                    >
                                        <option value="MATRICULA">Matrícula</option>
                                        <option value="MENSALIDADE">Mensalidade</option>
                                    </Form.Control>
                                    {fieldErrors.type && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.type}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex mt-3">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="d-flex align-items-center"
                                disabled={loading}
                            >
                                <FaSave className="me-2" />
                                {loading ? 'Salvando...' : 'Salvar Desconto'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="table-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaList className="me-2" />
                        Lista de Descontos
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries 
                        page={discountPage || { content: [], number: 0, totalPages: 1, size: 10 }}
                        entityName={'discounts'}
                        onDelete={handleDelete}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </Card.Body>
            </Card>

        </div>
    );
};

export default DiscountManager;
