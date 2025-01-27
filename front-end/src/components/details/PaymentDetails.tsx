// filepath: /e:/IdeaProjects/school-control/frontend/src/components/PaymentDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPaymentById } from '../../services/PaymentService';

const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    const getPayment = async () => {
      const paymentData = await fetchPaymentById(id);
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
      <p>Date: {payment.date}</p>
      <p>Student ID: {payment.studentId}</p>
      <p>Discount ID: {payment.discountId}</p>
      {/* Adicione mais detalhes conforme necessário */}
    </div>
  );
};

export default PaymentDetails;