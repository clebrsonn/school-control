import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { getPaymentById } from '../../features/payments/services/PaymentService.ts';
import { PaymentResponse } from '../../features/payments/types/PaymentTypes.ts';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { FaCalendarAlt, FaCreditCard, FaFileInvoice, FaMoneyBillWave, FaUser } from 'react-icons/fa';

/**
 * PaymentDetails component displays detailed information about a specific payment.
 * It fetches payment data based on the ID from the route parameters.
 *
 * @returns {React.FC} The PaymentDetails component.
 */
const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [payment, setPayment] = useState<PaymentResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    /**
     * Fetches the payment data from the server.
     */
    const getPayment = async () => {
      if (!id) {
        setError(t('paymentDetails.notifications.noIdProvided')); // Example of a specific error key
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const paymentData = await getPaymentById(id);
        setPayment(paymentData);
      } catch (e: any) {
        const errorMessage = e.message || t('paymentDetails.notifications.fetchFailed');
        notification(errorMessage, 'error');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    getPayment();
  }, [id, t]);

  /**
   * Formats a date string or Date object into a localized date string.
   * @param {string | Date | undefined} dateInput - The date to format.
   * @returns {string} The formatted date string or a 'not defined' message.
   */
  const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return t('paymentDetails.notDefined');
    try {
      // Ensure dateInput is a Date object or valid date string before calling toLocaleDateString
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) { // Check if date is valid
          return t('paymentDetails.invalidDate');
      }
      return date.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return t('paymentDetails.invalidDate');
    }
  };

  /**
   * Returns a Bootstrap Badge component styled according to the payment method,
   * with the payment method name translated.
   * @param {string} method - The payment method string (e.g., 'PIX', 'CREDIT_CARD').
   * @returns {React.ReactElement} A Badge component.
   */
  const getStatusBadge = (method?: string): React.ReactElement => {
    if (!method) return <Badge bg="secondary">{t('paymentDetails.notDefined')}</Badge>;

    switch (method) {
      case 'PIX':
        return <Badge bg="success">{t('paymentDetails.paymentMethods.pix')}</Badge>;
      case 'CREDIT_CARD':
        return <Badge bg="primary">{t('paymentDetails.paymentMethods.creditCard')}</Badge>;
      case 'BANK_SLIP':
        return <Badge bg="warning">{t('paymentDetails.paymentMethods.bankSlip')}</Badge>;
      default:
        return <Badge bg="secondary">{method}</Badge>; // Display method as is if not specifically translated
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-danger">{error}</p>; 
  }

  if (!payment) {
    return <p>{t('paymentDetails.notifications.paymentNotFound')}</p>; // Specific message if payment is not found
  }


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaMoneyBillWave className="me-2" />
          {t('paymentDetails.title')}
        </h1>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <h5 className="mb-4">{t('paymentDetails.infoTitle')}</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <FaMoneyBillWave className="text-success" />
                    </div>
                    <div>
                      <div className="text-muted small">{t('paymentDetails.labels.amount')}</div>
                      <div className="fw-bold">
                        {/* Currency formatting kept as BRL, assuming fixed currency */}
                        {payment.amount ? `R$ ${payment.amount.toLocaleString(i18n.language)}` : t('paymentDetails.notDefined')}
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
                      <div className="text-muted small">{t('paymentDetails.labels.paymentDate')}</div>
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
                      <div className="text-muted small">{t('paymentDetails.labels.invoiceId')}</div>
                      <div className="fw-bold">
                        {payment.invoiceId || t('paymentDetails.notDefined')}
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
                      <div className="text-muted small">{t('paymentDetails.labels.paymentMethod')}</div>
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
                        <div className="text-muted small">{t('paymentDetails.labels.responsibleName')}</div>
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
