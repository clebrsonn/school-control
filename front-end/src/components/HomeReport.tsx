import React, {useEffect, useState} from 'react';
import {
    fetchLatePayments,
    fetchMostLatePayers,
    fetchOnTimePayers,
    fetchTotalEstimatedForCurrentMonth
} from '@services/PaymentService';
import {IResponsible, ITuition} from '@hyteck/shared';
import {Container, ListGroup} from 'react-bootstrap';
import ErrorMessage from './ErrorMessage';
import {LoadingSpinner} from './LoadingSpinner';

const HomeReport: React.FC = () => {
  const [latePayments, setLatePayments] = useState<ITuition[]>([]);
  const [totalEstimated, setTotalEstimated] = useState<number>(0);
  const [onTimePayers, setOnTimePayers] = useState<any[]>([]);
  const [mostLatePayers, setMostLatePayers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [latePaymentsData, totalEstimatedData, onTimePayersData, mostLatePayersData] = await Promise.all([
          fetchLatePayments(),
          fetchTotalEstimatedForCurrentMonth(),
          fetchOnTimePayers(),
          fetchMostLatePayers()
        ]);
        setLatePayments(latePaymentsData);
        setTotalEstimated(totalEstimatedData);
        setOnTimePayers(onTimePayersData);
        setMostLatePayers(mostLatePayersData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
      return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Container>
      <h1>Relatório de Pagamentos</h1>
      <h2>Pagamentos em Atraso</h2>
      <ListGroup>
        {latePayments.map(payment => (
          <ListGroup.Item key={payment._id}>
            {(payment.responsible as IResponsible).name} - {payment.amount} - {new Date(payment.dueDate).toLocaleDateString()}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <h2>Total Estimado para o Mês Atual</h2>
      <p>{totalEstimated}</p>

      <h2>Responsáveis que Pagam em Dia</h2>
      <ListGroup>
        {onTimePayers.map(payer => (
          <ListGroup.Item key={payer._id}>
            {payer.responsible.name} - {payer.count} pagamentos
          </ListGroup.Item>
        ))}
      </ListGroup>

      <h2>Responsáveis que Mais Atrasam</h2>
      <ListGroup>
        {mostLatePayers.map(payer => (
          <ListGroup.Item key={payer._id}>
            {payer.responsible.name} - {payer.count} atrasos
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default HomeReport;