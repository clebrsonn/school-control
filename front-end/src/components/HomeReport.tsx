import React, { useEffect, useState } from 'react';
import {
    fetchLatePayments,
    fetchMostLatePayers,
    fetchOnTimePayers,
    fetchOpenPayments,
    fetchTotalEstimatedForCurrentMonth
} from '@services/PaymentService';
import { IResponsible, ITuition } from '@hyteck/shared';
import { Card, Col, Container, ListGroup, Row } from 'react-bootstrap';
import ErrorMessage from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

const HomeReport: React.FC = () => {
    const [openPayments, setOpenPayments] = useState<ITuition[]>([]);
    const [latePayments, setLatePayments] = useState<ITuition[]>([]);
    const [totalEstimated, setTotalEstimated] = useState<number>(0);
    const [onTimePayers, setOnTimePayers] = useState<any[]>([]);
    const [mostLatePayers, setMostLatePayers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    latePaymentsData,
                    totalEstimatedData,
                    onTimePayersData,
                    mostLatePayersData,
                    openPaymentsData,
                ] = await Promise.all([
                    fetchLatePayments(),
                    fetchTotalEstimatedForCurrentMonth(),
                    fetchOnTimePayers(),
                    fetchMostLatePayers(),
                    fetchOpenPayments(),
                ]);
                setLatePayments(latePaymentsData);
                setTotalEstimated(totalEstimatedData);
                setOnTimePayers(onTimePayersData);
                setMostLatePayers(mostLatePayersData);
                setOpenPayments(openPaymentsData);

                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <Container>
            <h1>Relatório de Pagamentos</h1>
            <Row>
                <Col md={12}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Total Estimado para o Mês Atual</Card.Title>
                            <Card.Text>R$ {totalEstimated.toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Pagamentos em Aberto</Card.Title>
                            <ListGroup className="mt-3">
                                {openPayments.map((payment) => (
                                    <ListGroup.Item key={payment._id}>
                                        {(payment.responsible as IResponsible)?.name} - R$ {payment.totalAmount} -{' '}
                                        {new Date(payment.year, payment.month, 10).toLocaleDateString()}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Pagamentos em Atraso</Card.Title>
                            <ListGroup className="mt-3">
                                {latePayments.map((payment) => (
                                    <ListGroup.Item key={payment._id}>
                                        {(payment.responsible as IResponsible)?.name} - R$ {payment.amount} -{' '}
                                        {new Date(payment.dueDate).toLocaleDateString()}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Responsáveis que Pagam em Dia</Card.Title>
                            <ListGroup className="mt-3">
                                {onTimePayers.map((payer) => (
                                    <ListGroup.Item key={payer._id}>
                                        {payer.responsible?.name} - {payer.count} pagamentos
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Responsáveis que Mais Atrasam</Card.Title>
                            <ListGroup className="mt-3">
                                {mostLatePayers.map((payer) => (
                                    <ListGroup.Item key={payer._id}>
                                        {payer.responsible?.name} - {payer.count} atrasos
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HomeReport;