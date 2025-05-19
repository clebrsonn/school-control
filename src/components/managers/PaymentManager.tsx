import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import { getConsolidatedStatements } from '../../features/billing/services/BillingService';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes';
import { processPayment } from '../../features/payments/services/PaymentService';
import { PaymentMethod, PaymentRequest } from '../../features/payments/types/PaymentTypes';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

const PaymentManager: React.FC = () => {
    const [consolidatedStatements, setConsolidatedStatements] = useState<ConsolidatedStatement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const currentDate = new Date();
                const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                const statements = await getConsolidatedStatements(yearMonth);
                setConsolidatedStatements(statements);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Erro ao carregar as invoices.');
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const handleProcessPayment = async (invoice: ConsolidatedStatement) => {
        try {
            const paymentRequest: PaymentRequest = {
                invoiceId: invoice.items[0].invoiceId,
                amount: invoice.totalAmountDue,
                paymentMethod: PaymentMethod.PIX, // Exemplo: pode ser alterado para outro método de pagamento
                paymentDate: new Date().toISOString(),
            };

            await processPayment(paymentRequest);
            notification(`Pagamento processado para a invoice ${invoice.items[0].invoiceId}`, 'success');

            const currentDate = new Date();
            const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const updatedStatements = await getConsolidatedStatements(yearMonth);
            setConsolidatedStatements(updatedStatements);

        } catch (err: any) {
            notification(err.message || 'Erro ao processar o pagamento.', 'error');
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    return (
        <div>
            <h1 className="mb-4">Gerenciar Pagamentos</h1>

            {consolidatedStatements.length > 0 ? (
                consolidatedStatements.map((statement) => (
                    <Card className="dashboard-card border-0 mb-4" key={statement.responsibleId}>
                        <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0">Responsável: {statement.responsibleName}</h5>
                            </div>
                            <div className="d-flex align-items-center">
                                <Badge
                                    bg={statement.totalAmountDue === 0 ? 'success' : 'warning'}
                                    className="me-3"
                                >
                                    {statement.totalAmountDue === 0 ? 'Paga' : 'Aberta'}
                                </Badge>
                                {statement.totalAmountDue > 0 && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleProcessPayment(statement)}
                                    >
                                        Pagar
                                    </Button>
                                )}
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <h6 className="mb-3">
                                Total: R$ {statement.totalAmountDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h6>
                            <ListGroup variant="flush">
                                {statement.items
                                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                    .map((item: StatementLineItem) => (
                                        <ListGroup.Item
                                            key={item.invoiceId}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <strong>{item.studentName}</strong>
                                                <div className="text-muted small">
                                                    {item.description} - Vencimento: {formatDate(item.dueDate)}
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <p className="text-muted text-center">Nenhuma invoice encontrada.</p>
            )}
        </div>
    );
};

export default PaymentManager;

