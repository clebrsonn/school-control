import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import Modal from 'react-modal';
import ErrorMessage from '@components/ErrorMessage';
import {Button, Col, Container, ListGroup, Row} from 'react-bootstrap';
import {ITuition} from '@hyteck/shared';
import {createPayment, fetchPaymentsByParentId, updatePayment} from "../../services/PaymentService.ts";
import {ModalType, ModalTypes} from "../../types/modal.ts";
import {LoadingSpinner} from "../LoadingSpinner.tsx";
import {useParentDetails} from "../../hooks/useParentDetails.ts";
import {MonthlyFeeFormModal, StudentFormModal} from "../modals/StudentFormModal.tsx";
import {ErrorBoundary} from "../ErrorBoundary.tsx";
import notification from "../Notification.tsx";

const ParentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { parent, students, monthlyFees, error } = useParentDetails(id);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [payments, setPayments] = useState<ITuition[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      const parentId = id as string;
      const fetchedPayments = await fetchPaymentsByParentId(parentId);
      setPayments(fetchedPayments);
    };

    loadPayments();
  }, [id]);

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const updatedPayment = await updatePayment(paymentId, { status: "paid" });
      setPayments(payments.map(p => p._id === paymentId ? updatedPayment : p));
      notification("Pagamento atualizado com sucesso!", "success");
    } catch (error: any) {
      notification(error.message || "Erro ao atualizar pagamento.", "error");
    }
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
            <Button variant="primary" onClick={() => {
              setModalType(ModalTypes.MONTHLY_FEE);
              setModalIsOpen(true);
            }}>
              Adicionar Pagamento
            </Button>
          </Col>
        </Row>

        <p>Name: {parent.name}</p>
        <p>Email: {parent.email}</p>
        <p>Phone: {parent.phone}</p>

        <h2>Students</h2>

        <ListGroup className="mt-3">
          {students.map((student) => (
            <ListGroup.Item key={student._id} className="bg-dark text-white">
              <Link to={`/students/${student._id}`}>{student.name}</Link>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <h2>Monthly Fees</h2>
        <ListGroup className="mt-3">
          {monthlyFees?.map((monthlyFee) => (
            <ListGroup.Item key={monthlyFee._id as string}>
              {monthlyFee.totalDebt} - {new Date(monthlyFee?._id?.year, monthlyFee?._id?.month -1, 10).toLocaleDateString()}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <h2>Payments</h2>
        {payments.map(payment => (
          <div key={payment._id}>
            <span>{payment.dueDate} - R$ {payment.amount} - {payment.status}</span>
            {payment.status !== "paid" && (
              <button onClick={() => handleMarkAsPaid(payment._id)}>Marcar como pago</button>
            )}
          </div>
        ))}

        <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
          {modalType === ModalTypes.STUDENT && (
            <StudentFormModal parentId={id as string} onClose={() => setModalIsOpen(false)} />
          )}
          {modalType === ModalTypes.MONTHLY_FEE && (
            <MonthlyFeeFormModal
              onSubmit={createPayment}
              onClose={() => setModalIsOpen(false)}
            />
          )}
        </Modal>
      </Container>
    </ErrorBoundary>
  );
};

export default ParentDetails;