import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { Button, Card, Col, ListGroup, Row, Table } from 'react-bootstrap';
import { PaymentMethod, PaymentResponse } from '../../features/payments/types/PaymentTypes';
import { getPaymentsByResponsible, processPayment } from '../../features/payments/services/PaymentService.ts';
import { ModalType, ModalTypes } from '../../types/modal.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { useParentDetails } from '../../features/parents/components/useParentDetails.ts';
import { MonthlyFeeFormModal, StudentFormModal } from '../modals/StudentFormModal.tsx';
import { ErrorBoundary } from '../common/ErrorBoundary.tsx';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { FaCreditCard, FaEnvelope, FaPhone, FaPlus, FaUser, FaUserGraduate } from 'react-icons/fa';
import { getConsolidatedStatement } from '../../features/billing/services/BillingService';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes';

const ParentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { parent, students, monthlyFees, error } = useParentDetails(id as string);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [consolidatedStatement, setConsolidatedStatement] = useState<ConsolidatedStatement | null>(null);

    useEffect(() => {
        const loadPayments = async () => {
            const parentId = id as string;
            const fetchedPayments = await getPaymentsByResponsible(parentId);
            setPayments(fetchedPayments);
        };

        loadPayments();
    }, [id]);

    useEffect(() => {
        const loadConsolidatedStatement = async () => {
            try {
                const parentId = id as string;
                const currentDate = new Date();
                const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                const statement = await getConsolidatedStatement(parentId, yearMonth);
                setConsolidatedStatement(statement);
            } catch (error: any) {
                notification(error.message || 'Erro ao carregar as invoices.', 'error');
            }
        };

        loadConsolidatedStatement();
    }, [id]);

    const groupPaymentsByMonth = (payments: PaymentResponse[]): { [month: string]: PaymentResponse[] } => {
        const groupedPayments: { [month: string]: PaymentResponse[] } = {};
        payments.forEach(payment => {
            const month = new Date(payment.paymentDate).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            if (!groupedPayments[month]) {
                groupedPayments[month] = [];
            }
            groupedPayments[month].push(payment);
        });
        return groupedPayments;
    };

    const groupedPayments = groupPaymentsByMonth(payments);

    const handleProcessPayment = async (invoice: StatementLineItem) => {
        try {
            await processPayment({
                invoiceId: invoice.invoiceId,
                amount: invoice.amount,
                paymentMethod: PaymentMethod.PIX,
                paymentDate: new Date()
            });

            notification('Pagamento processado com sucesso!', 'success');

            // Atualizar a lista de pagamentos em aberto após o pagamento
            const parentId = id as string;
            const currentDate = new Date();
            const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const updatedStatement = await getConsolidatedStatement(parentId, yearMonth);
            setConsolidatedStatement(updatedStatement);
        } catch (error: any) {
            notification(error.message || 'Erro ao processar o pagamento.', 'error');
        }
    };

    const formatDate = (dateString: string | Date): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    };

    if (error) return <ErrorMessage message={error} />;
    if (!parent) return <LoadingSpinner />;

    return (
        <ErrorBoundary>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">
                        <FaUser className="me-2" />
                        Detalhes do Responsável
                    </h1>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setModalType(ModalTypes.STUDENT);
                            setModalIsOpen(true);
                        }}
                        className="d-flex align-items-center"
                    >
                        <FaPlus className="me-2" />
                        Adicionar Aluno
                    </Button>
                </div>

                <Row className="mb-4">
                    <Col md={12}>
                        <Card className="dashboard-card border-0">
                            <Card.Body>
                                <h5 className="mb-4">Informações Pessoais</h5>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                                <FaUser className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">Nome</div>
                                                <div className="fw-bold">{parent.name}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                                <FaEnvelope className="text-info" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">Email</div>
                                                <div className="fw-bold">{parent.email || 'Não informado'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                                <FaPhone className="text-success" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">Telefone</div>
                                                <div className="fw-bold">{parent.phone || 'Não informado'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="dashboard-card border-0 mb-4">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <FaUserGraduate className="me-2 text-info" />
                            Alunos
                        </h5>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                                setModalType(ModalTypes.STUDENT);
                                setModalIsOpen(true);
                            }}
                            className="d-flex align-items-center"
                        >
                            <FaPlus className="me-2" />
                            Adicionar
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        {students.length > 0 ? (
                            <ListGroup variant="flush">
                                {students.map((student) => (
                                    <ListGroup.Item key={student.id}
                                                    className="d-flex justify-content-between align-items-center px-0 py-3 border-bottom">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                                                <FaUserGraduate className="text-info" />
                                            </div>
                                            <div>
                                                <Link to={`/students/${student.id}`}
                                                      className="text-decoration-none fw-bold">{student.name}</Link>
                                            </div>
                                        </div>
                                        <Link to={`/students/${student.id}`} className="btn btn-sm btn-outline-primary">Ver
                                            Detalhes</Link>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <p className="text-muted text-center my-4">Nenhum aluno cadastrado</p>
                        )}
                    </Card.Body>
                </Card>

                <Card className="dashboard-card border-0">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <FaCreditCard className="me-2 text-success" />
                            Pagamentos Realizados
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        {Object.entries(groupedPayments).length > 0 ? (
                            Object.entries(groupedPayments).map(([month, monthPayments]) => (
                                <div key={month} className="mb-4">
                                    <h6 className="mb-3 fw-bold">{month}</h6>
                                    <div className="table-responsive">
                                        <Table hover className="border-0">
                                            <thead className="table-light">
                                            <tr>
                                                <th>Data de Pagamento</th>
                                                <th>Valor</th>
                                                <th>Método</th>
                                                <th>ID da Fatura</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {monthPayments.map(payment => (
                                                <tr key={payment.id}>
                                                    <td>{formatDate(payment.paymentDate)}</td>
                                                    <td className="fw-bold">R$ {payment.amount}</td>
                                                    <td>{payment.paymentMethod}</td>
                                                    <td><small className="text-muted">{payment.invoiceId}</small></td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted text-center my-4">Nenhum pagamento registrado</p>
                        )}
                    </Card.Body>
                </Card>

                <Card className="dashboard-card border-0">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <FaCreditCard className="me-2 text-warning" />
                            Pagamentos em Aberto
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        {consolidatedStatement ? (
                            <div>
                                <h6 className="mb-3 fw-bold">
                                    Total: R$ {consolidatedStatement.totalAmountDue.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                })}
                                </h6>
                                <div className="table-responsive">
                                    <Table hover className="border-0">
                                        <thead className="table-light">
                                        <tr>
                                            <th>Aluno</th>
                                            <th>Descrição</th>
                                            <th>Valor</th>
                                            <th>Data de Vencimento</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {consolidatedStatement.items.map((item: StatementLineItem) => (
                                            <tr key={item.invoiceId}>
                                                <td>{item.studentName}</td>
                                                <td>{item.description}</td>
                                                <td className="fw-bold">R$ {item.amount.toLocaleString('pt-BR')}</td>
                                                <td>{formatDate(item.dueDate)}</td>
                                                <td>
                            <span className={`badge ${item.amount === 0 ? 'bg-success' : 'bg-warning'}`}>
                              {item.amount === 0 ? 'Paga' : 'Pendente'}
                            </span>
                                                </td>
                                                <td>
                                                    {item.amount > 0 && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleProcessPayment(item)}
                                                        >
                                                            Pagar
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted text-center my-4">Nenhum pagamento em aberto</p>
                        )}
                    </Card.Body>
                </Card>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    style={{
                        content: {
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '20px',
                            borderRadius: '8px'
                        },
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }}
                >
                    {modalType === ModalTypes.STUDENT && (
                        <StudentFormModal parentId={id as string} onClose={() => setModalIsOpen(false)} />
                    )}
                    {modalType === ModalTypes.MONTHLY_FEE && (
                        <MonthlyFeeFormModal
                            onSubmit={(amount, dueDate) => {
                                // Convert to PaymentRequest
                                return processPayment({
                                    invoiceId: `invoice-${Date.now()}`, // Generate a temporary invoice ID
                                    amount: parseFloat(amount),
                                    paymentMethod: PaymentMethod.PIX,
                                    paymentDate: new Date(dueDate)
                                });
                            }}
                            onClose={() => setModalIsOpen(false)}
                        />
                    )}
                </Modal>
            </div>
        </ErrorBoundary>
    );
};

export default ParentDetails;
