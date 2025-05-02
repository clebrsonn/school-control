// filepath: /e:/IdeaProjects/school-control/frontend/src/components/PaymentDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPaymentById } from '../../features/payments/services/PaymentService.ts';
import { PaymentResponse } from '../../features/payments/types/PaymentTypes.ts';

const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentResponse>();

  useEffect(() => {
    const getPayment = async () => {
      const paymentData = await getPaymentById(id);
      setPayment(paymentData);
    };
    getPayment();
  }, [id]);

  if (!payment) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Payment Details</h2>
      <p>Amount: {payment.amount}</p>
      <p>Date: {payment.paymentDate.getDate()}</p>
      <p>Matrícula: {payment.invoiceId}</p>
      <p>Status: {payment.paymentMethod}</p>
      {/* Adicione mais detalhes conforme necessário */}
    </div>
  );
};

export default PaymentDetails;