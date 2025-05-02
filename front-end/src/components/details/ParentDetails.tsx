import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { Button, Col, Container, ListGroup, Row, Table } from 'react-bootstrap';
import { PaymentMethod, PaymentResponse } from '../../features/payments/types/PaymentTypes';
import { getPaymentsByResponsible, processPayment } from '../../features/payments/services/PaymentService.ts';
import { ModalType, ModalTypes } from '../../types/modal.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { useParentDetails } from '../../features/parents/components/useParentDetails.ts';
import { MonthlyFeeFormModal, StudentFormModal } from '../modals/StudentFormModal.tsx';
import { ErrorBoundary } from '../common/ErrorBoundary.tsx';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

const ParentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { parent, students, monthlyFees, error } = useParentDetails(id);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      const parentId = id as string;
      const fetchedPayments = await getPaymentsByResponsible(parentId);
      setPayments(fetchedPayments);
    };

    loadPayments();
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


  const handleMarkMonthAsPaid = async (month: string) => {
    try {
      const paymentsToPay = groupedPayments[month];
      const updatedPayments = await Promise.all(paymentsToPay.map(payment => 
        processPayment({
          invoiceId: payment.invoiceId,
          amount: payment.amount,
          paymentMethod: PaymentMethod.PIX // Default payment method
        })
      ));

      // Refresh payments after processing
      const parentId = id as string;
      const fetchedPayments = await getPaymentsByResponsible(parentId);
      setPayments(fetchedPayments);

      notification("Pagamentos do mês atualizados com sucesso!", "success");

    } catch (error: any) {
      notification(error.message || "Erro ao atualizar pagamentos do mês.", "error");
    }
  };


  const formatDate = (dateString: string | Date): string => { // Aceita string ou Date
    const date = new Date(dateString); // Cria um objeto Date
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };


  if (error) return <ErrorMessage message={error} />;
  if (!parent) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <Container>
        <Row className="align-items-center mb-3">
          <Col>
            <h1>Responsável</h1>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={() => {
              setModalType(ModalTypes.STUDENT);
              setModalIsOpen(true);
            }} className="me-2">
              Adicionar Aluno
            </Button>
            {/* <Button variant="primary" onClick={() => {
              setModalType(ModalTypes.MONTHLY_FEE);
              setModalIsOpen(true);
            }}>
              Adicionar Pagamento
            </Button> */}
          </Col>
        </Row>

        <p>Name: {parent.name}</p>
        <p>Email: {parent.email}</p>
        <p>Phone: {parent.phone}</p>

        <h2>Students</h2>

        <ListGroup className="mt-3">
          {students.map((student) => (
            <ListGroup.Item key={student.id} className="bg-dark text-white">
              <Link to={`/students/${student.id}`}>{student.name}</Link>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {/*<h2>Monthly Fees</h2>*/}
        {/*<ListGroup className="mt-3">*/}
        {/*  {monthlyFees?.map((monthlyFee) => (*/}
        {/*    <ListGroup.Item key={monthlyFee.id as string}>*/}
        {/*      {monthlyFee.totalDebt} - {new Date(monthlyFee?.id?.year, monthlyFee?.id?.month -1, 10).toLocaleDateString()}*/}
        {/*    </ListGroup.Item>*/}
        {/*  ))}*/}
        {/*</ListGroup>*/}

        <h2>Payments</h2>
        {Object.entries(groupedPayments).map(([month, monthPayments]) => (
            <div key={month}>
              <h3>{month}</h3>
              <Table striped bordered hover>
                <thead>
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
                      <td>R$ {payment.amount}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{payment.invoiceId}</td>
                    </tr>
                ))}
                </tbody>
              </Table>
              <Button
                  onClick={() => handleMarkMonthAsPaid(month)}
              >
                Pagar {monthPayments.reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Button>
            </div>
        ))}

        <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
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
                  paymentMethod: PaymentMethod.PIX
                });
              }}
              onClose={() => setModalIsOpen(false)}
            />
          )}
        </Modal>
      </Container>
    </ErrorBoundary>
  );
};

export default ParentDetails;
