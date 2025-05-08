import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { getPaymentById } from '../../features/payments/services/PaymentService.ts';
import { PaymentResponse } from '../../features/payments/types/PaymentTypes.ts';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { FaCalendarAlt, FaCreditCard, FaFileInvoice, FaMoneyBillWave, FaUser } from 'react-icons/fa';

const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentResponse>();

  useEffect(() => {
    const getPayment = async () => {
        try{
            const paymentData = await getPaymentById(id);
            setPayment(paymentData);
        }catch (e) {
            notification(e.message || 'Failed to fetch payment data.', 'error');
        }

    };
    getPayment();
  }, [id]);

  if (!payment) {
    return <LoadingSpinner />;
  }

  // Format date properly
  const formatDate = (date: any) => {
    if (!date) return 'Não definido';

    // If it's a Date object
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }

    // If it's a string, try to convert to Date
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Get payment status badge
  const getStatusBadge = (method: string) => {
    switch (method) {
      case 'PIX':
        return <Badge bg="success">PIX</Badge>;
      case 'CREDIT_CARD':
        return <Badge bg="primary">Cartão de Crédito</Badge>;
      case 'BANK_SLIP':
        return <Badge bg="warning">Boleto</Badge>;
      default:
        return <Badge bg="secondary">{method || 'Não definido'}</Badge>;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaMoneyBillWave className="me-2" />
          Detalhes do Pagamento
        </h1>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <h5 className="mb-4">Informações do Pagamento</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <FaMoneyBillWave className="text-success" />
                    </div>
                    <div>
                      <div className="text-muted small">Valor</div>
                      <div className="fw-bold">
                        {payment.amount ? `R$ ${payment.amount}` : 'Não definido'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                      <FaCalendarAlt className="text-info" />
                    </div>
                    <div>
                      <div className="text-muted small">Data de Pagamento</div>
                      <div className="fw-bold">
                        {formatDate(payment.paymentDate)}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <FaFileInvoice className="text-primary" />
                    </div>
                    <div>
                      <div className="text-muted small">ID da Fatura</div>
                      <div className="fw-bold">
                        {payment.invoiceId || 'Não definido'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                      <FaCreditCard className="text-warning" />
                    </div>
                    <div>
                      <div className="text-muted small">Método de Pagamento</div>
                      <div className="fw-bold">
                        {getStatusBadge(payment.paymentMethod)}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {payment.responsibleName && (
                <Row>
                  <Col md={6} className="mb-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-secondary bg-opacity-10 p-3 me-3">
                        <FaUser className="text-secondary" />
                      </div>
                      <div>
                        <div className="text-muted small">Responsável</div>
                        <div className="fw-bold">
                          {payment.responsibleName}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentDetails;
