// filepath: /e:/IdeaProjects/school-control/frontend/src/components/PaymentDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPaymentById, updateTuitionValue } from '../../features/payments/services/PaymentService.ts';
import { ITuition } from '@hyteck/shared';
import { Button, Form } from 'react-bootstrap';
import notification from '../common/Notification.tsx';

const PaymentDetails: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<ITuition>();
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    const getPayment = async () => {
      const paymentData = await fetchPaymentById(id);
      setPayment(paymentData);
    };
    getPayment();
  }, [id, isEditing]);

  const [newAmount, setNewAmount] = useState<number>(0);

  useEffect(() => {
    if (payment) {
      setNewAmount(payment.amount);
    }
  }, [payment]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewAmount(payment?.amount || 0);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewAmount(Number(event.target.value));
  };

  const validateAmount = (value: number) => {
    let errorMessage = '';
    if (value <= 0) {
      errorMessage = 'Amount must be greater than zero';
    }
    setValidationError(errorMessage);
    return errorMessage;
  };

  const handleUpdateAmount = async () => {
    if (payment && newAmount !== payment.amount && !validationError) {
      try {
        await updateTuitionValue(payment._id, newAmount);
        setPayment({ ...payment, amount: newAmount });

        setNewAmount(newAmount);

        setIsEditing(false);
        notification('Valor da mensalidade atualizado com sucesso!', 'success');
      } catch (error: any) {
        notification(`Erro ao atualizar valor da mensalidade: ${error.message}`, 'error');
      }
    }
  };

  if (!payment) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <h2>Payment Details</h2>
      {isEditing ? (
        <Form.Group>
          <Form.Label>New Amount:</Form.Label>
          <Form.Control
            type="number"
            value={newAmount}
            onChange={handleAmountChange}
            onBlur={(e) => validateAmount(Number(e.target.value))}
            isInvalid={!!validationError}
          />
          {validationError && <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>}
          <Button onClick={handleUpdateAmount} className="mt-2 me-2">Update Amount</Button>
          <Button variant="secondary" onClick={handleCancelEdit} className="mt-2">Cancel</Button>
        </Form.Group>
      ) : (
        <>
          <p>Amount: {payment.amount}</p>
          <Button onClick={handleEditClick}>Edit Amount</Button>
        </>
      )}
    </div>
  );
};

export default PaymentDetails;