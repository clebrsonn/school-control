import React, {useEffect, useState} from 'react';
import {Container, ListGroup} from 'react-bootstrap';
import {groupPaymentsByMonthAndParent} from '@services/PaymentService';
import ErrorMessage from '../ErrorMessage';
import {ITuition} from '@hyteck/shared';

const PaymentManager: React.FC = () => {
  // const [payments, setPayments] = useState<ITuition[]>([]);
  const [groupedPayments, setGroupedPayments] = useState<any[]>([]);
  // const [amount, setAmount] = useState('');
  // const [date, setDate] = useState('');
  // const [discountId, setDiscountId] = useState('');
  // const [parentId, setParentId] = useState('');
  // const [classId, setClassId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPayments = async () => {
      try {
        // const payments = await fetchPayments();
        // setPayments(payments);
        const grouped = await groupPaymentsByMonthAndParent();
        setGroupedPayments(grouped);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
      }
    };

    getPayments();
  }, []);

  // const handleAddPayment = async () => {
  //   try {
  //     const newPayment = { amount: parseFloat(amount), date, discountId, parentId, classId };
  //     const addedPayment = await createPayment(newPayment);
  //     setPayments([...payments, addedPayment]);
  //     setAmount('');
  //     setDate('');
  //     setDiscountId('');
  //     setParentId('');
  //     setClassId('');
  //     setError(null);
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to add payment');
  //   }
  // };

  // const handleDelete = async (id: string) => {
  //   try {
  //     await deletePaymentById(id);
  //     setPayments(payments.filter((student) => student._id !== id));
  //     notification("Pagamento removido com sucesso.");
  //   } catch {
  //     setError("Erro ao remover o pagamento.");
  //   }
  // };

  return (
    <Container className="bg-dark text-white p-4">
      <h1>Gerenciar Pagamentos</h1>
      {error && <ErrorMessage message={error} />}
      {/* <Form>
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
      </Form> */}
      {/* <h2 className="mt-4">Pagamentos Agrupados</h2> */}
      {groupedPayments.map((group) => (
        <div key={`${group.year}-${group.month}-${group.responsible}`}>
          <h3>{`${group.month}/${group.year} - ${group.responsible.name}`}</h3>
          <p>Total Amount: {group.totalAmount}</p>
          <ListGroup>
            {group.payments.map((payment: ITuition) => (
              <ListGroup.Item key={payment._id}>
                {payment.amount} - {new Date(payment.dueDate).toLocaleDateString()} - {payment.status.toString()}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      ))}
    </Container>
  );
};

export default PaymentManager;