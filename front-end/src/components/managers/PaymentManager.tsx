import React, { useState, useEffect } from 'react';
import { fetchPayments, addPayment } from '@services/PaymentService';
import { fetchParents } from '@services/ParentService';
import ErrorMessage from '@components/ErrorMessage';
import { Button, Container, Form, ListGroup } from 'react-bootstrap';
import { Parent, Payment } from '@types';

const PaymentManager: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [discountId, setDiscountId] = useState('');
  const [parentId, setParentId] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
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

    const getParents = async () => {
      try {
        const parents = await fetchParents();
        setParents(parents);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch parents');
      }
    };

    getPayments();
    getParents();
  }, []);

  const handleAddPayment = async () => {
    try {
      const newPayment = { amount: parseFloat(amount), date, discountId, parentId };
      const addedPayment = await addPayment(newPayment);
      setPayments([...payments, addedPayment]);
      setAmount('');
      setDate('');
      setDiscountId('');
      setParentId('');
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
            type="text"
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
        <Form.Group controlId="formDiscountId">
          <Form.Label>ID do Desconto</Form.Label>
          <Form.Control
            type="text"
            placeholder="ID do Desconto"
            value={discountId}
            onChange={(e) => setDiscountId(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formParentId">
          <Form.Label>Responsável</Form.Label>
          <Form.Control
            as="select"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">Selecione um responsável</option>
            {parents.map((parent) => (
              <option key={parent._id} value={parent._id}>
                {parent.nome}
              </option>
            ))}
          </Form.Control>
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