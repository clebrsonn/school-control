// filepath: /e:/IdeaProjects/school-control/frontend/src/components/PaymentDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPaymentById } from '../../features/payments/services/PaymentService.ts';
import { PaymentResponse } from '../../features/payments/types/PaymentTypes.ts';
import notification from '../common/Notification.tsx';

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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Payment Details</h2>
      <p>Amount: {payment.amount}</p>
      <p>Date: {payment.paymentDate?.getDate()}</p>
      <p>Matrícula: {payment.invoiceId}</p>
      <p>Status: {payment.paymentMethod}</p>
      {/* Adicione mais detalhes conforme necessário */}
    </div>
  );
};

export default PaymentDetails;