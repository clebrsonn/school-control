import React from 'react';
import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getConsolidatedStatements } from '../../features/billing/services/BillingService';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes';
import { processPayment } from '../../features/payments/services/PaymentService';
import { PaymentMethod, PaymentRequest } from '../../features/payments/types/PaymentTypes';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

const PaymentManager: React.FC = () => {
    const queryClient = useQueryClient();
    const currentDate = new Date();
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Busca consolidada de statements
    const {
        data: consolidatedStatements = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['consolidatedStatements', yearMonth],
        queryFn: () => getConsolidatedStatements(yearMonth),
    });

    // Mutation para processar pagamento
    const processPaymentMutation = useMutation({
        mutationFn: async (invoice: ConsolidatedStatement) => {
            const paymentRequest: PaymentRequest = {
                invoiceId: invoice.items[0].invoiceId,
                amount: invoice.totalAmountDue,
                paymentMethod: PaymentMethod.PIX,
                paymentDate: new Date(),
            };
            await processPayment(paymentRequest);
        },
        onSuccess: () => {
            notification('Pagamento processado com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['consolidatedStatements', yearMonth] });
        },
        onError: (err: any) => {
            notification(err.message || 'Erro ao processar o pagamento.', 'error');
        }
    });

    const handleProcessPayment = (invoice: ConsolidatedStatement) => {
        processPaymentMutation.mutate(invoice);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="text-danger">{String(error)}</p>;
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
                                        disabled={processPaymentMutation.isLoading}
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

