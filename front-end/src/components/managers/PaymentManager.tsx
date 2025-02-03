import React, { useState, useEffect } from 'react';
import { Form, Button, Container, ListGroup } from 'react-bootstrap';
import { fetchPayments, addPayment } from '../../services/PaymentService';
import ErrorMessage from '../ErrorMessage';
import { ITuition } from '@hyteck/shared';

const PaymentManager: React.FC = () => {
  const [payments, setPayments] = useState<ITuition[]>([]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [discountId, setDiscountId] = useState('');
  const [parentId, setParentId] = useState('');
  const [classId, setClassId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPayments = async () => {
      try {
        const payments = await fetchPayments();
        setPayments(payments);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
      }
    };

    getPayments();
  }, []);

  const handleAddPayment = async () => {
    try {
      const newPayment = { amount: parseFloat(amount), date, discountId, parentId, classId };
      const addedPayment = await addPayment(newPayment);
      setPayments([...payments, addedPayment]);
      setAmount('');
      setDate('');
      setDiscountId('');
      setParentId('');
      setClassId('');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add payment');
    }
  };

  return (
    <Container className="bg-dark text-white p-4">
      <h1>Gerenciar Pagamentos</h1>
      {error && <ErrorMessage message={error} />}
      <Form>
        <Form.Group controlId="formPaymentAmount">
          <Form.Label>Valor</Form.Label>
          <Form.Control
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPaymentDate">
          <Form.Label>Data</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPaymentDiscountId">
          <Form.Label>ID do Desconto</Form.Label>
          <Form.Control
            type="text"
            placeholder="ID do Desconto"
            value={discountId}
            onChange={(e) => setDiscountId(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPaymentParentId">
          <Form.Label>ID do Responsável</Form.Label>
          <Form.Control
            type="text"
            placeholder="ID do Responsável"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPaymentClassId">
          <Form.Label>ID da Classe</Form.Label>
          <Form.Control
            type="text"
            placeholder="ID da Classe"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleAddPayment} className="mt-3">
          Salvar
        </Button>
      </Form>
      <ListGroup className="mt-3">
        {payments.map((payment) => (
          <ListGroup.Item key={payment._id} className="bg-dark text-white">
            {payment.amount} - {payment.date} - {payment.discountId ? payment.discountId : 'No Discount'} - {payment.parentId.nome}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};


export default PaymentManager;