import React, { useEffect, useState } from 'react';
import {
    fetchLatePayments,
    fetchMostLatePayers,
    fetchOnTimePayers,
    fetchTotalEstimatedForCurrentMonth,
} from '@services/PaymentService';
import { IResponsible, ITuition } from '@hyteck/shared';
import { Container, ListGroup, Row, Col } from 'react-bootstrap';
import ErrorMessage from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

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
                const [
                    latePaymentsData,
                    totalEstimatedData,
                    onTimePayersData,
                    mostLatePayersData,
                ] = await Promise.all([
                    fetchLatePayments(),
                    fetchTotalEstimatedForCurrentMonth(),
                    fetchOnTimePayers(),
                    fetchMostLatePayers(),
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

    // Data for the Late Payments Bar Chart
    const latePaymentsChartData = {
        labels: latePayments.map(
            (payment) =>
                `${(payment.responsible as IResponsible).name} - ${new Date(payment.dueDate).toLocaleDateString()}`
        ),
        datasets: [
            {
                label: 'Valor em Atraso',
                data: latePayments.map((payment) => payment.amount),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    // Data for the On-Time Payers Pie Chart
    const onTimePayersChartData = {
        labels: onTimePayers.map((payer) => payer.responsible.name),
        datasets: [
            {
                label: 'Pagamentos em Dia',
                data: onTimePayers.map((payer) => payer.count),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                ],
            },
        ],
    };

    // Data for the Most Late Payers Pie Chart
    const mostLatePayersChartData = {
        labels: mostLatePayers.map((payer) => payer.responsible.name),
        datasets: [
            {
                label: 'Atrasos',
                data: mostLatePayers.map((payer) => payer.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
            },
        ],
    };

    return (
        <Container>
            <h1>Relatório de Pagamentos</h1>
            <Row>
                <Col md={12}>
                    <h2>Total Estimado para o Mês Atual</h2>
                    <p>R$ {totalEstimated.toFixed(2)}</p>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <h2>Pagamentos em Atraso</h2>
                    <Bar data={latePaymentsChartData} />
                    <ListGroup>
                        {latePayments.map((payment) => (
                            <ListGroup.Item key={payment._id}>
                                {(payment.responsible as IResponsible).name} - R$ {payment.amount} -{' '}
                                {new Date(payment.dueDate).toLocaleDateString()}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>

                <Col md={6}>
                    <h2>Responsáveis que Pagam em Dia</h2>
                    <Pie data={onTimePayersChartData} />
                    <ListGroup>
                        {onTimePayers.map((payer) => (
                            <ListGroup.Item key={payer._id}>
                                {payer.responsible.name} - {payer.count} pagamentos
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <h2>Responsáveis que Mais Atrasam</h2>
                    <Pie data={mostLatePayersChartData} />
                    <ListGroup>
                        {mostLatePayers.map((payer) => (
                            <ListGroup.Item key={payer._id}>
                                {payer.responsible.name} - {payer.count} atrasos
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    );
};

export default HomeReport;