import React from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { Badge, Button, Card, Col, ListGroup, Row, Table } from 'react-bootstrap';
import { FaCreditCard, FaEnvelope, FaPhone, FaPlus, FaUser, FaUserGraduate } from 'react-icons/fa';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { ErrorBoundary } from '../common/ErrorBoundary.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { useParentDetailsViewModel } from './viewmodels/useParentDetailsViewModel';
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
    const vm = useParentDetailsViewModel();

    if (vm.parentDetailsError) return <ErrorMessage message={vm.parentDetailsError?.message || String(vm.parentDetailsError)} />;
    if (!vm.parent) return <LoadingSpinner />;

    const groupedPayments = vm.groupPaymentsByMonth(vm.payments);

    return (
        <ErrorBoundary>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">
                        <FaUser className="me-2" />
                        {vm.t('parentDetails.title')}
                    </h1>
                </div>
                {/* Personal Information Section */}
                <Row className="mb-4">
                    <Col md={12}>
                        <Card className="dashboard-card border-0">
                            <Card.Body>
                                <h5 className="mb-4">{vm.t('parentDetails.personalInfoTitle')}</h5>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                                <FaUser className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">{vm.t('parentDetails.labels.name')}</div>
                                                <div className="fw-bold">{vm.parent.name}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                                <FaEnvelope className="text-info" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">{vm.t('parentDetails.labels.email')}</div>
                                                <div className="fw-bold">{vm.parent.email || vm.t('parentDetails.labels.notInformed')}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                                <FaPhone className="text-success" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">{vm.t('parentDetails.labels.phone')}</div>
                                                <div className="fw-bold">{vm.parent.phone || vm.t('parentDetails.labels.notInformed')}</div>
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
                            {vm.t('parentDetails.studentsTitle')}
                        </h5>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => vm.setModalIsOpen(true)}
                            className="d-flex align-items-center"
                        >
                            <FaPlus className="me-2" />
                            {vm.t('parentDetails.buttons.addStudent')}
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        {vm.students && vm.students.length > 0 ? (
                            <ListGroup variant="flush">
                                {vm.students.map(student => (
                                    <ListGroup.Item key={student.id} className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <FaUserGraduate className="me-2 text-info" />
                                            <span className="fw-bold">{student.name}</span>
                                        </div>
                                        <div>
                                            <Button as={Link} to={`/students/${student.id}`} variant="outline-secondary" size="sm">
                                                {vm.t('parentDetails.buttons.viewDetails')}
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="text-muted">{vm.t('parentDetails.noStudentsRegistered')}</div>
                        )}
                    </Card.Body>
                </Card>
                {/* Realized Payments Section */}
                <Card className="dashboard-card border-0 mb-4">
                    <Card.Header className="bg-transparent">
                        <h5 className="mb-0">{vm.t('parentDetails.realizedPaymentsTitle')}</h5>
                    </Card.Header>
                    <Card.Body>
                        {vm.loadingPayments ? (
                            <LoadingSpinner />
                        ) : Object.keys(groupedPayments).length === 0 ? (
                            <div className="text-muted">{vm.t('parentDetails.noPaymentsRegistered')}</div>
                        ) : (
                            Object.entries(groupedPayments).map(([month, payments]) => (
                                <div key={month} className="mb-4">
                                    <h6 className="fw-bold mb-2">{month}</h6>
                                    <Table size="sm" responsive bordered hover>
                                        <thead>
                                            <tr>
                                                <th>{vm.t('parentDetails.table.paymentDate')}</th>
                                                <th>{vm.t('parentDetails.table.value')}</th>
                                                <th>{vm.t('parentDetails.table.method')}</th>
                                                <th>{vm.t('parentDetails.table.invoiceId')}</th>
                                                <th>{vm.t('parentDetails.table.description')}</th>
                                                <th>{vm.t('parentDetails.table.paymentDate')}</th>
                                                <th>{vm.t('parentDetails.table.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map(payment => (
                                                <tr key={payment.id}>
                                                    <td>{vm.formatDate(payment.paymentDate)}</td>
                                                    <td>{payment.amount.toLocaleString(vm.i18n.language, { style: 'currency', currency: 'BRL' })}</td>
                                                    <td>{vm.t(`paymentDetails.paymentMethods.${payment.paymentMethod}`)}</td>
                                                    <td>{payment.invoiceId}</td>
                                                    <td>{payment.description}</td>
                                                    <td>{vm.formatDate(payment.paymentDate)}</td>
                                                    <td>
                                                        <Badge bg={payment.paymentDate ? 'success' : 'secondary'}>
                                                            {payment.paymentDate ? vm.t('parentDetails.statusPaid') : vm.t('parentDetails.statusPending')}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ))
                        )}
                    </Card.Body>
                </Card>
                {/* Pending Payments Section */}
                <Card className="dashboard-card border-0 mb-4">
                    <Card.Header className="bg-transparent">
                        <h5 className="mb-0">{vm.t('parentDetails.pendingPaymentsTitle')}</h5>
                    </Card.Header>
                    <Card.Body>
                        {vm.loadingStatement ? (
                            <LoadingSpinner />
                        ) : !vm.consolidatedStatement || vm.consolidatedStatement.items.length === 0 ? (
                            <div className="text-muted">{vm.t('parentDetails.noPendingPayments')}</div>
                        ) : (
                            <>
                                <Table size="sm" responsive bordered hover>
                                    <thead>
                                        <tr>
                                            <th>{vm.t('parentDetails.table.description')}</th>
                                            <th>{vm.t('parentDetails.table.dueDate')}</th>
                                            <th>{vm.t('parentDetails.table.value')}</th>
                                            <th>{vm.t('parentDetails.table.status')}</th>
                                            <th>{vm.t('parentDetails.table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vm.consolidatedStatement.items.map(item => (
                                            <tr key={item.invoiceId}>
                                                <td>{item.description}</td>
                                                <td>{vm.formatDate(item.dueDate)}</td>
                                                <td>{item.amount.toLocaleString(vm.i18n.language, { style: 'currency', currency: 'BRL' })}</td>
                                                <td>
                                                    <Badge bg={item.status === 'PAID' ? 'success' : 'warning'}>
                                                        {item.status === 'PAID' ? vm.t('parentDetails.statusPaid') : vm.t('parentDetails.statusPending')}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {item.status !== 'PAID' && (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => vm.handleProcessPayment(item)}
                                                        >
                                                            <FaCreditCard className="me-1" /> {vm.t('parentDetails.buttons.pay')}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className="fw-bold mt-3">
                                    {vm.t('parentDetails.totalOpenPayments')}{' '}
                                    {vm.consolidatedStatement.totalAmountDue.toLocaleString(vm.i18n.language, { style: 'currency', currency: 'BRL' })}
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
                <Modal
                    isOpen={vm.modalIsOpen}
                    onRequestClose={() => vm.setModalIsOpen(false)}
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
                    {vm.id && <StudentManager responsible={vm.id} />}
                </Modal>            </div>
        </ErrorBoundary>
    );
};

export default ParentDetails;
