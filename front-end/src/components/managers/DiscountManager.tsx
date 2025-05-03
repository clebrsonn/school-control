import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { IDiscount } from '@hyteck/shared';
import { createDiscount, deleteDiscount, fetchDiscounts } from '../../features/enrollments/services/DiscountService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { PageResponse } from '../../types/PageResponse';
import { usePagination } from '../../hooks/usePagination';
import { FaList, FaPercentage, FaSave } from 'react-icons/fa';
import ErrorMessage from '../common/ErrorMessage.tsx';

const DiscountManager: React.FC = () => {
    const { 
        currentPage, 
        pageSize, 
        handlePageChange,
        createEmptyPageResponse
    } = usePagination<IDiscount>();

    const [discountPage, setDiscountPage] = useState<PageResponse<IDiscount>>(createEmptyPageResponse());
    const [name, setName] = useState<string>(""); // Nome do desconto
    const [value, setValue] = useState<number>(0); // Valor fixo do desconto
    const [validUntil, setValidUntil] = useState<string>(""); // Data de validade do desconto
    const [type, setType] = useState<string>("enroll"); // Tipo de desconto
    const [error, setError] = useState<string | null>(null); // Erros do formulário
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Mensagem de feedback

    // Carrega os descontos ao montar o componente ou quando a paginação muda
    useEffect(() => {
        const getDiscounts = async () => {
            try {
                const fetchedDiscounts = await fetchDiscounts(currentPage, pageSize);
                setDiscountPage(fetchedDiscounts);
            } catch (err: any) {
                setError("Erro ao carregar os descontos.");
            }
        };
        getDiscounts();
    }, [currentPage, pageSize]);

    // Submissão do formulário para adicionar um novo desconto
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || value <= 0 || !validUntil || !type) {
            setError("Por favor, preencha todos os campos corretamente.");
            return;
        }

        try {
            await createDiscount({ name, value, validUntil, type });

            // Refresh the discount list to get the updated data
            const refreshedData = await fetchDiscounts(currentPage, pageSize);
            setDiscountPage(refreshedData);

            setName("");
            setValue(0);
            setValidUntil("");
            setType("enroll");
            setSuccessMessage("Desconto criado com sucesso!");
        } catch (err: any) {
            setError("Erro ao criar o desconto.");
        }
    };

    // Exclusão de um desconto
    const handleDelete = async (id: string) => {
        try {
            await deleteDiscount(id);

            // Refresh the discount list to get the updated data
            const refreshedData = await fetchDiscounts(currentPage, pageSize);
            setDiscountPage(refreshedData);
        } catch (err: any) {
            setError("Erro ao excluir o desconto.");
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
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Adicionar Desconto</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="discountName">
                                    <Form.Label>Nome do Desconto</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Exemplo: Desconto para alunos novos"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="discountValue">
                                    <Form.Label>Valor do Desconto</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Exemplo: 50"
                                        value={value}
                                        onChange={(e) => setValue(Number(e.target.value))}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="discountValidUntil">
                                    <Form.Label>Validade do Desconto</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="discountType">
                                    <Form.Label>Tipo de Desconto</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        required
                                    >
                                        <option value="enroll">Matrícula</option>
                                        <option value="tuition">Mensalidade</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex mt-3">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="d-flex align-items-center"
                            >
                                <FaSave className="me-2" />
                                Salvar Desconto
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
                        page={discountPage} 
                        entityName={'discounts'}
                        onDelete={handleDelete}
                        onPageChange={handlePageChange}
                    />
                </Card.Body>
            </Card>

        </div>
    );
};

export default DiscountManager;
