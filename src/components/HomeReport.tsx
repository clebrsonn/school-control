import React, { useEffect, useState } from 'react';
import { Badge, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    FaCalendarCheck,
    FaCalendarTimes,
    FaChalkboardTeacher,
    FaChartLine,
    FaMoneyBillWave,
    FaUserCheck,
    FaUserGraduate,
    FaUsers
} from 'react-icons/fa';
import ErrorMessage from './common/ErrorMessage.tsx';
import { LoadingSpinner } from './common/LoadingSpinner.tsx';
import { countInvoicesByStatus, generateMonthlyBiling } from '../features/billing/services/BillingService';
import notification from './common/Notification.tsx';

const HomeReport: React.FC = () => {
    const [openPayments, setOpenPayments] = useState<any[]>([]);
    const [latePayments, setLatePayments] = useState<any[]>([]);

    const [openInvoicesCount, setOpenInvoicesCount] = useState<number>(0);
    const [lateInvoicesCount, setLateInvoicesCount] = useState<number>(0);
    const [totalEstimated, setTotalEstimated] = useState<number>(0);
    const [onTimePayers, setOnTimePayers] = useState<any[]>([]);
    const [mostLatePayers, setMostLatePayers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateBilling = async () => {
        const currentDate = new Date();
        const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        try {
            await generateMonthlyBiling(yearMonth);
            notification('Cobrança mensal gerada com sucesso!', 'info');
        } catch (error) {
            notification('Erro ao gerar cobrança mensal.', 'error');
        }
    };

    useEffect(() => {
        const fetchInvoiceCounts = async () => {
            try {
                setLoading(true);
                const [openCount, lateCount] = await Promise.all([
                    countInvoicesByStatus('PENDING'),
                    countInvoicesByStatus('OVERDUE'),
                ]);
                setOpenInvoicesCount(openCount);
                setLateInvoicesCount(lateCount);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Erro ao carregar contagem de invoices.');
                setLoading(false);
            }
        };

        fetchInvoiceCounts();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaChartLine className="me-2" />
                    Dashboard
                </h1>
                <button className="btn btn-primary" onClick={handleGenerateBilling}>
                    Gerar Cobrança Mensal
                </button>
            </div>

            {/* Quick Stats Row */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-4 mb-lg-0">
                    <Card className="dashboard-card h-100 border-0">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <h6 className="text-muted mb-1">Total Estimado</h6>
                                    <h3 className="mb-0">R$ {totalEstimated.toFixed(2)}</h3>
                                </div>
                                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                                    <FaMoneyBillWave className="text-primary" size={24} />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <Link to="/payments" className="btn btn-sm btn-outline-primary">Ver Pagamentos</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4 mb-lg-0">
                    <Card className="dashboard-card h-100 border-0">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <h6 className="text-muted mb-1">Pagamentos em Aberto</h6>
                                    <h3 className="mb-0">{openInvoicesCount}</h3>
                                </div>
                                <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                                    <FaCalendarCheck className="text-warning" size={24} />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <Badge bg="warning" className="me-2">{openInvoicesCount} pendentes</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4 mb-lg-0">
                    <Card className="dashboard-card h-100 border-0">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <h6 className="text-muted mb-1">Pagamentos em Atraso</h6>
                                    <h3 className="mb-0">{lateInvoicesCount}</h3>
                                </div>
                                <div className="rounded-circle bg-danger bg-opacity-10 p-3">
                                    <FaCalendarTimes className="text-danger" size={24} />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <Badge bg="danger" className="me-2">{lateInvoicesCount} atrasados</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4 mb-lg-0">
                    <Card className="dashboard-card h-100 border-0">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <h6 className="text-muted mb-1">Pagamentos em Dia</h6>
                                    <h3 className="mb-0">{onTimePayers.length}</h3>
                                </div>
                                <div className="rounded-circle bg-success bg-opacity-10 p-3">
                                    <FaUserCheck className="text-success" size={24} />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <Badge bg="success" className="me-2">{onTimePayers.length} responsáveis</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Access Row */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card className="dashboard-card border-0">
                        <Card.Body>
                            <h5 className="mb-4">Acesso Rápido</h5>
                            <Row>
                                <Col sm={3} xs={6} className="mb-3">
                                    <Link to="/parents" className="text-decoration-none">
                                        <Card className="text-center h-100 py-4">
                                            <Card.Body>
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                                                    <FaUsers className="text-primary" size={24} />
                                                </div>
                                                <h6>Responsáveis</h6>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                                <Col sm={3} xs={6} className="mb-3">
                                    <Link to="/students" className="text-decoration-none">
                                        <Card className="text-center h-100 py-4">
                                            <Card.Body>
                                                <div className="rounded-circle bg-info bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                                                    <FaUserGraduate className="text-info" size={24} />
                                                </div>
                                                <h6>Estudantes</h6>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                                <Col sm={3} xs={6} className="mb-3">
                                    <Link to="/payments" className="text-decoration-none">
                                        <Card className="text-center h-100 py-4">
                                            <Card.Body>
                                                <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                                                    <FaMoneyBillWave className="text-success" size={24} />
                                                </div>
                                                <h6>Pagamentos</h6>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                                <Col sm={3} xs={6} className="mb-3">
                                    <Link to="/classes" className="text-decoration-none">
                                        <Card className="text-center h-100 py-4">
                                            <Card.Body>
                                                <div className="rounded-circle bg-warning bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                                                    <FaChalkboardTeacher className="text-warning" size={24} />
                                                </div>
                                                <h6>Turmas</h6>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Payments Lists Row */}
            <Row>
                <Col md={6} className="mb-4">
                    <Card className="dashboard-card border-0 h-100">
                        <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <FaCalendarCheck className="me-2 text-warning" />
                                Pagamentos em Aberto
                            </h5>
                            <Link to="/payments" className="btn btn-sm btn-outline-primary">Ver Todos</Link>
                        </Card.Header>
                        <Card.Body>
                            {openInvoicesCount > 0 ? (
                                <ListGroup variant="flush">
                                    {openPayments.slice(0, 5).map((payment) => (
                                        <ListGroup.Item key={payment.id as string} className="d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <strong>{payment.responsible}</strong>
                                                <div className="text-muted small">
                                                    {new Date(payment.paymentDate?.getUTCFullYear() || 0, payment.paymentDate?.getUTCMonth() || 1, 10).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Badge bg="warning">R$ {payment.amount}</Badge>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted text-center my-4">Não há pagamentos em aberto</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} className="mb-4">
                    <Card className="dashboard-card border-0 h-100">
                        <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <FaCalendarTimes className="me-2 text-danger" />
                                Pagamentos em Atraso
                            </h5>
                            <Link to="/payments" className="btn btn-sm btn-outline-primary">Ver Todos</Link>
                        </Card.Header>
                        <Card.Body>
                            {lateInvoicesCount > 0 ? (
                                <ListGroup variant="flush">
                                    {latePayments.slice(0, 5).map((payment) => (
                                        <ListGroup.Item key={payment.id as string} className="d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <strong>{(payment.responsible as IResponsible)?.name}</strong>
                                                <div className="text-muted small">
                                                    Vencimento: {new Date(payment.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Badge bg="danger">R$ {payment.amount}</Badge>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted text-center my-4">Não há pagamentos em atraso</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HomeReport;

