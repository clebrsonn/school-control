import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getConsolidatedStatements } from '../../features/billing/services/BillingService';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes';
import { processPayment } from '../../features/payments/services/PaymentService';
import { PaymentMethod, PaymentRequest } from '../../features/payments/types/PaymentTypes';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

// Shadcn/UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from 'lucide-react'; // Icon for title

const PaymentManager: React.FC = () => {
    const queryClient = useQueryClient();
    const currentDate = new Date();
    // Format to YYYY-MM, which getConsolidatedStatements might expect. Adjust if API needs different.
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const {
        data: consolidatedStatements = [],
        isLoading,
        error,
        // refetch // Available if needed
    } = useQuery<ConsolidatedStatement[], Error>({
        queryKey: ['consolidatedStatements', yearMonth],
        queryFn: () => getConsolidatedStatements(yearMonth),
    });

    const processPaymentMutation = useMutation<void, Error, ConsolidatedStatement>({
        mutationFn: async (invoice: ConsolidatedStatement) => {
            if (!invoice.items || invoice.items.length === 0) {
                 notification('Fatura não contém itens para processar.', 'error');
                 throw new Error("Fatura sem itens.");
            }
            const paymentRequest: PaymentRequest = {
                invoiceId: invoice.items[0].invoiceId, // Assuming first item's invoiceId is representative
                amount: invoice.totalAmountDue,
                paymentMethod: PaymentMethod.PIX, // Defaulting to PIX, this could be a UI choice later
                paymentDate: new Date(),
                // description: `Pagamento para ${invoice.responsibleName}`, // Optional
            };
            if (!paymentRequest.invoiceId) {
                notification('ID da fatura não encontrado.', 'error');
                throw new Error("ID da fatura não encontrado para processar o pagamento.");
            }
            await processPayment(paymentRequest);
        },
        onSuccess: () => {
            notification('Pagamento processado com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['consolidatedStatements', yearMonth] });
        },
        onError: (err: Error) => {
            notification(err.message || 'Erro ao processar o pagamento.', 'error');
        }
    });

    const handleProcessPayment = (invoice: ConsolidatedStatement) => {
        if (invoice.totalAmountDue <= 0) {
            notification('Esta fatura não requer pagamento.', 'info');
            return;
        }
        processPaymentMutation.mutate(invoice);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error) {
        return <ErrorMessage message={`Erro ao carregar faturas consolidadas: ${error.message}`} title="Erro de Carregamento" />;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6" />
                <h1 className="text-2xl font-semibold">Gerenciar Pagamentos - {yearMonth}</h1>
            </div>

            {consolidatedStatements.length > 0 ? (
                <div className="space-y-4">
                    {consolidatedStatements.map((statement) => (
                        <Card key={statement.responsibleId} className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                                <CardTitle className="text-lg font-medium">
                                    Responsável: {statement.responsibleName}
                                </CardTitle>
                                <div className="flex items-center space-x-3">
                                    <Badge variant={statement.totalAmountDue === 0 ? 'success' : 'destructive'}>
                                        {statement.totalAmountDue === 0 ? 'Paga' : 'Aberta'}
                                    </Badge>
                                    {statement.totalAmountDue > 0 && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleProcessPayment(statement)}
                                            disabled={processPaymentMutation.isPending}
                                        >
                                            {processPaymentMutation.isPending ? 'Processando...' : 'Pagar Agora (PIX)'}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-xl font-semibold mb-3">
                                    Total Devido: {statement.totalAmountDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <div className="space-y-3">
                                    <h4 className="text-md font-medium text-muted-foreground">Itens da Fatura:</h4>
                                    {statement.items
                                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                        .map((item: StatementLineItem) => (
                                            <div
                                                key={item.invoiceId + item.description} // invoiceId might not be unique across items if they are part of same invoice
                                                className="flex justify-between items-start p-3 border rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold text-sm">{item.studentName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Vencimento: {formatDate(item.dueDate)}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold">
                                                    {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                        ))}
                                    {statement.items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item nesta fatura.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground py-4">
                            Nenhuma fatura consolidada encontrada para o período de {yearMonth}.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PaymentManager;
