import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPaymentById } from '../../features/payments/services/PaymentService.ts';
import { PaymentResponse, PaymentMethod } from '../../features/payments/types/PaymentTypes.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

// Shadcn/UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // For "Back" button

// Lucide Icons
import { DollarSign, CalendarDays, CreditCard, User, FileText, ArrowLeft } from 'lucide-react';

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode; iconColorClass?: string }> = ({ icon: Icon, label, value, iconColorClass = "text-primary" }) => (
    <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-full bg-muted`}> {/* Using muted for background for consistency */}
            <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'Não informado'}</p>
        </div>
    </div>
);


const PaymentDetails: React.FC = () => {
  const { id: paymentId } = useParams<{ id: string }>();

  const { data: payment, isLoading, error } = useQuery<PaymentResponse, Error>({
    queryKey: ['payment', paymentId],
    queryFn: () => getPaymentById(paymentId!),
    enabled: !!paymentId,
  });

  const formatDate = (dateInput: Date | string | undefined): string => {
    if (!dateInput) return 'N/A';
    try {
      return new Date(dateInput).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'});
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getPaymentMethodVariant = (method?: PaymentMethod): "default" | "secondary" | "destructive" | "outline" => {
    switch (method) {
      case PaymentMethod.PIX: return "success"; // Custom variant if 'success' is defined, else 'default'
      case PaymentMethod.CREDIT_CARD: return "default";
      case PaymentMethod.DEBIT_CARD: return "default";
      case PaymentMethod.BANK_SLIP: return "warning"; // Custom variant if 'warning' is defined, else 'secondary'
      case PaymentMethod.CASH: return "info"; // Custom variant if 'info' is defined, else 'secondary'
      default: return "secondary";
    }
  };
   const getPaymentMethodLabel = (method?: PaymentMethod): string => {
    if (!method) return 'Não definido';
    switch (method) {
        case PaymentMethod.PIX: return "PIX";
        case PaymentMethod.CREDIT_CARD: return "Cartão de Crédito";
        case PaymentMethod.DEBIT_CARD: return "Cartão de Débito";
        case PaymentMethod.BANK_SLIP: return "Boleto";
        case PaymentMethod.CASH: return "Dinheiro";
        default:
            const exhaustiveCheck: never = method; // Ensures all cases are handled
            return exhaustiveCheck || 'Não definido';
    }
};


  if (isLoading) return <LoadingSpinner fullScreen message="Carregando detalhes do pagamento..." />;
  if (error) return <ErrorMessage message={`Erro ao carregar pagamento: ${error.message}`} title="Erro"/>;
  if (!payment) return <ErrorMessage message="Pagamento não encontrado." title="Não Encontrado" />;

  return (
    <div className="p-4 md:p-6 space-y-6">
        <Button variant="outline" asChild className="mb-4">
            <Link to="/payments"> {/* Assuming /payments is the route for PaymentManager */}
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Pagamentos
            </Link>
        </Button>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                    <DollarSign className="mr-3 h-7 w-7 text-primary" />
                    Detalhes do Pagamento
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <DetailItem icon={DollarSign} label="Valor" value={formatCurrency(payment.amount)} iconColorClass="text-green-600" />
                    <DetailItem icon={CalendarDays} label="Data de Pagamento" value={formatDate(payment.paymentDate)} iconColorClass="text-blue-600" />
                    <DetailItem icon={CreditCard} label="Método de Pagamento" value={
                        <Badge variant={getPaymentMethodVariant(payment.paymentMethod)}>
                            {getPaymentMethodLabel(payment.paymentMethod)}
                        </Badge>
                    } iconColorClass="text-purple-600" />

                    {payment.invoiceId && <DetailItem icon={FileText} label="ID da Fatura (Interno)" value={payment.invoiceId} iconColorClass="text-gray-600" />}
                    {payment.studentName && <DetailItem icon={User} label="Aluno" value={payment.studentName} iconColorClass="text-indigo-600" />}
                    {payment.responsibleName && <DetailItem icon={User} label="Responsável" value={payment.responsibleName} iconColorClass="text-teal-600" />}
                    {payment.description && (
                        <div className="md:col-span-2"> {/* Description can span full width if needed */}
                             <DetailItem icon={FileText} label="Descrição" value={payment.description} iconColorClass="text-gray-600"/>
                        </div>
                    )}
                </div>

                {payment.referenceMonth && payment.referenceYear && (
                    <div className="pt-4 border-t">
                        <h3 className="text-md font-medium mb-2 text-muted-foreground">Período de Referência</h3>
                        <DetailItem icon={CalendarDays} label="Mês/Ano" value={`${payment.referenceMonth}/${payment.referenceYear}`} iconColorClass="text-gray-600"/>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default PaymentDetails;
