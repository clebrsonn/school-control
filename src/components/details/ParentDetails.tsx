import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, ListGroup, Row, Table, Badge } from 'react-bootstrap'; // Added Badge
import { PaymentMethod, PaymentResponse } from '../../features/payments/types/PaymentTypes.ts';
import { getPaymentsByResponsible, processPayment } from '../../features/payments/services/PaymentService.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { useParentDetails } from '../../features/parents/components/useParentDetails.ts';
import { ErrorBoundary } from '../common/ErrorBoundary.tsx';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { FaCreditCard, FaEnvelope, FaPhone, FaPlus, FaUser, FaUserGraduate } from 'react-icons/fa';
import { getConsolidatedStatement } from '../../features/billing/services/BillingService.ts';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes.ts';
import StudentManager from '../managers/StudentManager.tsx'; // Corrected import path

/**
 * ParentDetails component displays comprehensive details for a specific parent/responsible.
 * This includes personal information, a list of associated students,
 * a history of realized payments, and a section for pending payments with an option to pay.
 * It fetches data based on the parent ID from the route parameters.
 *
 * @returns {React.FC} The ParentDetails component.
 */
const ParentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation(); // i18n instance for date/currency localization
    const { parent, students, error: parentDetailsError } = useParentDetails(id as string); // Renamed error for clarity
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [consolidatedStatement, setConsolidatedStatement] = useState<ConsolidatedStatement | null>(null);
    const [loadingPayments, setLoadingPayments] = useState<boolean>(true);
    const [loadingStatement, setLoadingStatement] = useState<boolean>(true);

    // Effect for loading realized payments
    useEffect(() => {
        const loadPayments = async () => {
            if (!id) return;
            setLoadingPayments(true);
            try {
                const fetchedPayments = await getPaymentsByResponsible(id);
                setPayments(fetchedPayments);
            } catch (err: any) {
                notification(err.message || t('parentDetails.notifications.fetchPaymentsError'), 'error');
            } finally {
                setLoadingPayments(false);
            }
        };
        loadPayments();
    }, [id, t]);

    // Effect for loading consolidated (pending) statement
    useEffect(() => {
        const loadConsolidatedStatement = async () => {
            if (!id) return;
            setLoadingStatement(true);
            try {
                const currentDate = new Date();
                const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                const statement = await getConsolidatedStatement(id, yearMonth);
                setConsolidatedStatement(statement);
            } catch (error: any) {
                notification(error.message || t('parentDetails.notifications.loadInvoicesError'), 'error');
            } finally {
                setLoadingStatement(false);
            }
        };
        loadConsolidatedStatement();
    }, [id, t]); // Added t to dependency array

    /**
     * Groups payments by month and year for display.
     * @param {PaymentResponse[]} paymentsArray - Array of payment responses.
     * @returns {Object.<string, PaymentResponse[]>} Payments grouped by month string.
     */
    const groupPaymentsByMonth = (paymentsArray: PaymentResponse[]): { [month: string]: PaymentResponse[] } => {
        const groupedPayments: { [month: string]: PaymentResponse[] } = {};
        paymentsArray.forEach(payment => {
            // Use i18n.language for month localization
            const month = new Date(payment.paymentDate).toLocaleString(i18n.language, { month: 'long', year: 'numeric' });
            if (!groupedPayments[month]) {
                groupedPayments[month] = [];
            }
            groupedPayments[month].push(payment);
        });
        return groupedPayments;
    };

    const groupedPayments = groupPaymentsByMonth(payments);

    /**
     * Handles the processing of a payment for a specific invoice item.
     * @param {StatementLineItem} invoiceItem - The invoice item to be paid.
     */
    const handleProcessPayment = async (invoiceItem: StatementLineItem) => {
        if (!id) return;
        try {
            await processPayment({
                invoiceId: invoiceItem.invoiceId,
                amount: invoiceItem.amount,
                paymentMethod: PaymentMethod.PIX, // Defaulting to PIX
                paymentDate: new Date()
            });
            notification(t('parentDetails.notifications.paymentSuccess'), 'success');
            // Refresh pending payments after successful payment
            setLoadingStatement(true);
            const currentDate = new Date();
            const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const updatedStatement = await getConsolidatedStatement(id, yearMonth);
            setConsolidatedStatement(updatedStatement);
            // Also refresh realized payments
            setLoadingPayments(true);
            const fetchedPayments = await getPaymentsByResponsible(id);
            setPayments(fetchedPayments);

        } catch (error: any) {
            notification(error.message || t('parentDetails.notifications.paymentError'), 'error');
        } finally {
            setLoadingStatement(false); // Ensure loading state is reset
            setLoadingPayments(false);
        }
    };
    
    /**
     * Formats a date string or Date object into a localized date string.
     * @param {string | Date} dateString - The date to format.
     * @returns {string} The formatted date string.
     */
    const formatDate = (dateString: string | Date): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString(i18n.language, options); // Use i18n.language
    };

    if (parentDetailsError) return <ErrorMessage message={parentDetailsError?.message || String(parentDetailsError)} />;
    if (!parent) return <LoadingSpinner />; // Main parent data loading

    return (
        <ErrorBoundary>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">
                        <FaUser className="me-2" />
                        {t('parentDetails.title')}
                    </h1>
                </div>

                {/* Personal Information Section */}
                <Row className="mb-4">
                    <Col md={12}>
                        <Card className="dashboard-card border-0">
                            <Card.Body>
                                <h5 className="mb-4">{t('parentDetails.personalInfoTitle')}</h5>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                                <FaUser className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">{t('parentDetails.labels.name')}</div>
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
                                                <div className="text-muted small">{t('parentDetails.labels.email')}</div>
                                                <div className="fw-bold">{parent.email || t('parentDetails.labels.notInformed')}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                                <FaPhone className="text-success" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">{t('parentDetails.labels.phone')}</div>
                                                <div className="fw-bold">{parent.phone || t('parentDetails.labels.notInformed')}</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Students Section */}
                <Card className="dashboard-card border-0 mb-4">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <FaUserGraduate className="me-2 text-info" />
                            {t('parentDetails.studentsTitle')}
                        </h5>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setModalIsOpen(true)}
                            className="d-flex align-items-center"
                        >
                            <FaPlus className="me-2" />
                            {t('parentDetails.buttons.addStudent')}
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
                                        <Link to={`/students/${student.id}`} className="btn btn-sm btn-outline-primary">
                                            {t('parentDetails.buttons.viewDetails')}
                                        </Link>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <p className="text-muted text-center my-4">{t('parentDetails.noStudentsRegistered')}</p>
                        )}
                    </Card.Body>
                </Card>

                {/* Realized Payments Section */}
                <Card className="dashboard-card border-0 mb-4">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <FaCreditCard className="me-2 text-success" />
                            {t('parentDetails.realizedPaymentsTitle')}
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        {loadingPayments ? <LoadingSpinner /> : Object.entries(groupedPayments).length > 0 ? (
                            Object.entries(groupedPayments).map(([month, monthPayments]) => (
                                <div key={month} className="mb-4">
                                    <h6 className="mb-3 fw-bold">{month}</h6>
                                    <div className="table-responsive">
                                        <Table hover className="border-0">
                                            <thead className="table-light">
                                            <tr>
                                                <th>{t('parentDetails.table.paymentDate')}</th>
                                                <th>{t('parentDetails.table.value')}</th>
                                                <th>{t('parentDetails.table.method')}</th>
                                                <th>{t('parentDetails.table.invoiceId')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {monthPayments.map(payment => (
                                                <tr key={payment.id}>
                                                    <td>{formatDate(payment.paymentDate)}</td>
                                                    {/* Currency formatting kept as BRL for now */}
                                                    <td className="fw-bold">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
                            <p className="text-muted text-center my-4">{t('parentDetails.noPaymentsRegistered')}</p>
                        )}
                    </Card.Body>
                </Card>

                {/* Pending Payments Section */}
                <Card className="dashboard-card border-0">
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <FaCreditCard className="me-2 text-warning" />
                            {t('parentDetails.pendingPaymentsTitle')}
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        {loadingStatement ? <LoadingSpinner /> : consolidatedStatement && consolidatedStatement.items.length > 0 ? (
                            <div>
                                <h6 className="mb-3 fw-bold">
                                    {t('parentDetails.totalOpenPayments')} {consolidatedStatement.totalAmountDue.toLocaleString(i18n.language, {
                                    style: 'currency',
                                    currency: 'BRL' // Assuming BRL currency
                                })}
                                </h6>
                                <div className="table-responsive">
                                    <Table hover className="border-0">
                                        <thead className="table-light">
                                        <tr>
                                            <th>{t('parentDetails.table.student')}</th>
                                            <th>{t('parentDetails.table.description')}</th>
                                            <th>{t('parentDetails.table.value')}</th>
                                            <th>{t('parentDetails.table.dueDate')}</th>
                                            <th>{t('parentDetails.table.status')}</th>
                                            <th>{t('parentDetails.table.actions')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {consolidatedStatement.items.map((item: StatementLineItem) => (
                                            <tr key={item.invoiceId}>
                                                <td>{item.studentName}</td>
                                                <td>{item.description}</td>
                                                <td className="fw-bold">{item.amount.toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' })}</td>
                                                <td>{formatDate(item.dueDate)}</td>
                                                <td>
                                                    <Badge bg={item.status === 'PAID' ? 'success' : 'warning'}>
                                                        {item.status === 'PAID' ? t('parentDetails.statusPaid') : t('parentDetails.statusPending')}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {item.status !== 'PAID' && item.amount > 0 && ( // Ensure item is not already paid
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleProcessPayment(item)}
                                                            disabled={processPayment.isLoading} // Assuming processPayment is a mutation from useMutation
                                                        >
                                                            {t('parentDetails.buttons.pay')}
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
                            <p className="text-muted text-center my-4">{t('parentDetails.noPendingPayments')}</p>
                        )}
                    </Card.Body>
                </Card>

                {/* Modal for Adding Student */}
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    style={{ /* Styles remain unchanged */
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
                    ariaHideApp={false} // Important for test environments
                >
                    {id && <StudentManager responsible={id} />}
                </Modal>
            </div>
        </ErrorBoundary>
    );
};

export default ParentDetails;
