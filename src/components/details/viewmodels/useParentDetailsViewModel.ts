import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PaymentMethod, PaymentResponse } from '../../../features/payments/types/PaymentTypes';
import { getPaymentsByResponsible, processPayment } from '../../../features/payments/services/PaymentService';
import { getConsolidatedStatement } from '../../../features/billing/services/BillingService';
import { ConsolidatedStatement, StatementLineItem } from '../../../features/billing/types/BillingTypes';
import notification from '../../common/Notification';
import { useParentDetails } from '../../../features/parents/components/useParentDetails';
import { formatDateLocalized } from '../../../utils/dateUtils';

export function useParentDetailsViewModel() {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const { parent, students, error: parentDetailsError } = useParentDetails(id as string);
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [consolidatedStatement, setConsolidatedStatement] = useState<ConsolidatedStatement | null>(null);
    const [loadingPayments, setLoadingPayments] = useState<boolean>(true);
    const [loadingStatement, setLoadingStatement] = useState<boolean>(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        const loadPayments = async () => {
            if (!id) return;
            setLoadingPayments(true);
            try {
                const fetchedPayments = await getPaymentsByResponsible(id);
                setPayments(fetchedPayments);
            } catch (err: any) {
                notification(err.message || t('parentDetails.notifications.fetchPaymentsError'), 'error');
            } finally {
                setLoadingPayments(false);
            }
        };
        loadPayments();
    }, [id, t]);

    useEffect(() => {
        const loadConsolidatedStatement = async () => {
            if (!id) return;
            setLoadingStatement(true);
            try {
                const currentDate = new Date();
                const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                const statement = await getConsolidatedStatement(id, yearMonth);
                setConsolidatedStatement(statement);
            } catch (error: any) {
                notification(error.message || t('parentDetails.notifications.loadInvoicesError'), 'error');
            } finally {
                setLoadingStatement(false);
            }
        };
        loadConsolidatedStatement();
    }, [id, t]);

    const groupPaymentsByMonth = (paymentsArray: PaymentResponse[]): { [month: string]: PaymentResponse[] } => {
        const groupedPayments: { [month: string]: PaymentResponse[] } = {};
        paymentsArray.forEach(payment => {
            const month = new Date(payment.paymentDate).toLocaleString(i18n.language, { month: 'long', year: 'numeric' });
            if (!groupedPayments[month]) {
                groupedPayments[month] = [];
            }
            groupedPayments[month].push(payment);
        });
        return groupedPayments;
    };

    const handleProcessPayment = async (invoiceItem: StatementLineItem) => {
        if (!id) return;
        try {
            await processPayment({
                invoiceId: invoiceItem.invoiceId,
                amount: invoiceItem.amount,
                paymentMethod: PaymentMethod.PIX,
                paymentDate: new Date()
            });
            notification(t('parentDetails.notifications.paymentSuccess'), 'success');
            setLoadingStatement(true);
            const currentDate = new Date();
            const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const updatedStatement = await getConsolidatedStatement(id, yearMonth);
            setConsolidatedStatement(updatedStatement);
            setLoadingPayments(true);
            const fetchedPayments = await getPaymentsByResponsible(id);
            setPayments(fetchedPayments);
        } catch (error: any) {
            notification(error.message || t('parentDetails.notifications.paymentError'), 'error');
        } finally {
            setLoadingStatement(false);
            setLoadingPayments(false);
        }
    };

    const formatDate = (dateString: string | Date): string => {
        return formatDateLocalized(dateString, i18n.language);
    };

    return {
        t,
        i18n,
        id,
        parent,
        students,
        parentDetailsError,
        payments,
        consolidatedStatement,
        loadingPayments,
        loadingStatement,
        groupPaymentsByMonth,
        handleProcessPayment,
        formatDate,
        modalIsOpen,
        setModalIsOpen,
    };
}

