import React from 'react';
import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getConsolidatedStatements } from '../../features/billing/services/BillingService';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes';
import { processPayment } from '../../features/payments/services/PaymentService';
import { PaymentMethod, PaymentRequest } from '../../features/payments/types/PaymentTypes';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

/**
 * PaymentManager component displays consolidated financial statements for each responsible person.
 * It allows users (presumably administrators or financial staff) to view outstanding amounts
 * and trigger a payment process for open statements.
 * 
 * The component fetches data for the current month by default.
 * @returns {React.FC} The PaymentManager component.
 */
const PaymentManager: React.FC = () => {
    const { t, i18n } = useTranslation(); // i18n instance for date formatting language
    const queryClient = useQueryClient();
    const currentDate = new Date();
    // Generates yearMonth string like "YYYY-MM"
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Fetch consolidated statements for the current year and month
    const {
        data: consolidatedStatements = [], // Default to empty array
        isLoading,
        error,
        // refetch // refetch is available from useQuery if manual refresh is needed
    } = useQuery<ConsolidatedStatement[], Error>({ // Explicitly type useQuery
        queryKey: ['consolidatedStatements', yearMonth],
        queryFn: () => getConsolidatedStatements(yearMonth),
    });

    // Mutation for processing a payment
    const processPaymentMutation = useMutation<void, Error, ConsolidatedStatement>({ // Explicitly type useMutation
        mutationFn: async (invoice: ConsolidatedStatement) => {
            // Assuming the first item's invoiceId can represent the payment target,
            // or that the backend handles payment for the consolidated statement.
            if (!invoice.items || invoice.items.length === 0) {
                throw new Error(t('paymentManager.errors.noInvoiceItems'));
            }
            const paymentRequest: PaymentRequest = {
                invoiceId: invoice.items[0].invoiceId, // This might need adjustment based on actual API logic
                amount: invoice.totalAmountDue,
                paymentMethod: PaymentMethod.PIX, // Defaulting to PIX, could be made selectable
                paymentDate: new Date(),
            };
            await processPayment(paymentRequest);
        },
        onSuccess: () => {
            notification(t('paymentManager.notifications.paymentSuccess'), 'success');
            // Invalidate and refetch the statements to reflect the payment
            queryClient.invalidateQueries({ queryKey: ['consolidatedStatements', yearMonth] });
        },
        onError: (err: any) => {
            // Use a translated default message if no specific error message is available
            notification(err.message || t('paymentManager.notifications.paymentErrorDefault'), 'error');
        }
    });

    /**
     * Initiates the payment process for a given consolidated statement.
     * @param {ConsolidatedStatement} invoice - The consolidated statement to process payment for.
     */
    const handleProcessPayment = (invoice: ConsolidatedStatement) => {
        processPaymentMutation.mutate(invoice);
    };

    /**
     * Formats a date string into a localized date representation.
     * Uses the current i18next language for localization.
     * @param {string} dateString - The date string to format (expects ISO format or similar).
     * @returns {string} The formatted date string.
     */
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        // Use current i18next language for formatting
        return date.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        // Display error message (could also be an i18n key if errors are standardized)
        return <p className="text-danger">{error.message || t('paymentManager.errors.fetchError')}</p>;
    }

    return (
        <div>
            <h1 className="mb-4">{t('paymentManager.title')}</h1>

            {consolidatedStatements.length > 0 ? (
                consolidatedStatements.map((statement) => (
                    <Card className="dashboard-card border-0 mb-4" key={statement.responsibleId}>
                        <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0">{t('paymentManager.responsibleLabel')} {statement.responsibleName}</h5>
                            </div>
                            <div className="d-flex align-items-center">
                                <Badge
                                    bg={statement.totalAmountDue === 0 ? 'success' : 'warning'}
                                    className="me-3"
                                >
                                    {statement.totalAmountDue === 0 ? t('paymentManager.statusPaid') : t('paymentManager.statusOpen')}
                                </Badge>
                                {statement.totalAmountDue > 0 && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleProcessPayment(statement)}
                                        disabled={processPaymentMutation.isPending} // Use isPending for mutation state
                                    >
                                        {processPaymentMutation.isPending ? t('paymentManager.buttons.paying') : t('paymentManager.buttons.pay')}
                                    </Button>
                                )}
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <h6 className="mb-3">
                                {t('paymentManager.totalDueLabel')} {statement.totalAmountDue.toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' })}
                            </h6>
                            <ListGroup variant="flush">
                                {statement.items
                                    // Sort items by due date for consistent display
                                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                    .map((item: StatementLineItem) => (
                                        <ListGroup.Item
                                            key={item.invoiceId} // Assuming invoiceId is unique per item here
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <strong>{item.studentName}</strong>
                                                <div className="text-muted small">
                                                    {item.description} - {t('paymentManager.itemDescriptionLabel')} {formatDate(item.dueDate)}
                                                </div>
                                            </div>
                                            {/* Optionally display item amount or status here */}
                                        </ListGroup.Item>
                                    ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <p className="text-muted text-center">{t('paymentManager.noInvoicesFound')}</p>
            )}
        </div>
    );
};

export default PaymentManager;

