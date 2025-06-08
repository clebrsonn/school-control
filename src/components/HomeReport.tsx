import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ErrorMessage from './common/ErrorMessage.tsx';
import { LoadingSpinner } from './common/LoadingSpinner.tsx';
import {
    countInvoicesByStatus,
    generateMonthlyBiling,
    getConsolidatedMonth
} from '../features/billing/services/BillingService';
import notification from './common/Notification.tsx';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Lucide Icons
import {
    LayoutDashboard, // Replacement for FaChartLine
    DollarSign, // Replacement for FaMoneyBillWave
    ClockAlert, // Replacement for FaCalendarCheck (Open Payments)
    AlarmClockOff, // Replacement for FaCalendarTimes (Late Payments)
    Users, // FaUsers
    GraduationCap, // FaUserGraduate
    CreditCard, // FaMoneyBillWave (for Payments link)
    School, // FaChalkboardTeacher
    RefreshCw, // For Generate Billing
    AlertTriangle // For error states or empty states
} from 'lucide-react';

interface QuickLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  colorClass?: string; // e.g., text-blue-500
}

const QuickLinkCard: React.FC<QuickLinkProps> = ({ to, icon, label, colorClass = "text-primary" }) => (
    <Link to={to} className="block hover:no-underline group">
        <Card className="text-center h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <div className={`p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors`}>
                    {React.cloneElement(icon as React.ReactElement, { className: `${colorClass} h-8 w-8 transition-colors group-hover:text-primary` })}
                </div>
                <p className="font-medium text-card-foreground">{label}</p>
            </CardContent>
        </Card>
    </Link>
);

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    unit?: string;
    linkTo?: string;
    linkLabel?: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, unit, linkTo, linkLabel, variant, isLoading }) => (
    <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <LoadingSpinner size={6} className="my-2"/>
            ) : (
                <div className="text-2xl font-bold">{unit}{value}</div>
            )}
            {linkTo && linkLabel && (
                <Button variant="link" size="sm" asChild className="px-0 pt-2 text-xs text-muted-foreground">
                    <Link to={linkTo}>{linkLabel}</Link>
                </Button>
            )}
             {variant && !linkTo && unit && ( // For badges like open/late payments
                <Badge variant={variant} className="mt-2">{value} {unit}</Badge>
            )}
        </CardContent>
    </Card>
);


const HomeReport: React.FC = () => {
    const queryClient = useQueryClient();
    const currentDate = new Date();
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const { data: totalEstimated = 0, isLoading: loadingTotal, error: errorTotal } = useQuery<number, Error>({
        queryKey: ['consolidatedMonth', yearMonth],
        queryFn: () => getConsolidatedMonth(yearMonth)
    });

    const { data: openInvoicesCount = 0, isLoading: loadingOpen, error: errorOpen } = useQuery<number, Error>({
        queryKey: ['invoicesCount', 'PENDING'],
        queryFn: () => countInvoicesByStatus('PENDING')
    });

    const { data: lateInvoicesCount = 0, isLoading: loadingLate, error: errorLate } = useQuery<number, Error>({
        queryKey: ['invoicesCount', 'OVERDUE'],
        queryFn: () => countInvoicesByStatus('OVERDUE')
    });

    const generateBillingMutation = useMutation<void, Error, string>({
        mutationFn: generateMonthlyBiling,
        onSuccess: () => {
            notification('Cobrança mensal gerada com sucesso! As faturas estão sendo processadas.', 'success');
            queryClient.invalidateQueries({ queryKey: ['consolidatedMonth', yearMonth] });
            queryClient.invalidateQueries({ queryKey: ['invoicesCount', 'PENDING'] });
            // Potentially invalidate other relevant queries if billing generation affects them
        },
        onError: (error: Error) => {
            notification(`Erro ao gerar cobrança mensal: ${error.message}`, 'error');
        }
    });

    const handleGenerateBilling = () => {
        generateBillingMutation.mutate(yearMonth);
    };

    const overallLoading = loadingTotal || loadingOpen || loadingLate;
    // Combine errors for display if needed, or handle them per card
    const combinedError = errorTotal || errorOpen || errorLate;


    // Mock data for lists - replace with actual queries if needed
    const mockOpenPayments = Array.from({ length: Math.min(openInvoicesCount, 3) }).map((_, i) => ({
        id: `op-${i}`,
        responsibleName: `Responsável Exemplo ${i + 1}`,
        dueDate: new Date().toLocaleDateString('pt-BR'),
        amount: (Math.random() * 100 + 50).toFixed(2)
    }));
    const mockLatePayments = Array.from({ length: Math.min(lateInvoicesCount, 3) }).map((_, i) => ({
        id: `lp-${i}`,
        responsibleName: `Responsável Atrasado ${i + 1}`,
        dueDate: new Date(Date.now() - (i+1)*5*24*60*60*1000).toLocaleDateString('pt-BR'), // Due 5, 10, 15 days ago
        amount: (Math.random() * 150 + 70).toFixed(2)
    }));


    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-semibold flex items-center">
                    <LayoutDashboard className="mr-3 h-8 w-8 text-primary" />
                    Dashboard
                </h1>
                <Button onClick={handleGenerateBilling} disabled={generateBillingMutation.isPending}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${generateBillingMutation.isPending ? 'animate-spin' : ''}`} />
                    {generateBillingMutation.isPending ? 'Gerando...' : 'Gerar Cobrança Mensal'}
                </Button>
            </div>

            {combinedError && <ErrorMessage message={"Erro ao carregar alguns dados do dashboard: " + combinedError.message} className="mb-4" />}

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Estimado (Mês)"
                    value={totalEstimated.toFixed(2)}
                    unit="R$ "
                    icon={<DollarSign className="h-5 w-5 text-green-500" />}
                    linkTo="/payments"
                    linkLabel="Ver Pagamentos"
                    isLoading={loadingTotal}
                />
                 <StatCard
                    title="Pagamentos em Aberto"
                    value={openInvoicesCount}
                    unit="faturas"
                    icon={<ClockAlert className="h-5 w-5 text-yellow-500" />}
                    variant="warning"
                    isLoading={loadingOpen}
                />
                <StatCard
                    title="Pagamentos em Atraso"
                    value={lateInvoicesCount}
                    unit="faturas"
                    icon={<AlarmClockOff className="h-5 w-5 text-red-500" />}
                    variant="destructive"
                    isLoading={loadingLate}
                />
                 <StatCard
                    title="Pagamentos em Dia" // This seems to be a placeholder in original
                    value={0}
                    unit="faturas"
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    variant="success"
                    isLoading={false} // Assuming this is not dynamically loaded
                />
            </div>

            {/* Quick Access Row */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickLinkCard to="/parents" icon={<Users />} label="Responsáveis" colorClass="text-blue-500" />
                        <QuickLinkCard to="/students" icon={<GraduationCap />} label="Estudantes" colorClass="text-indigo-500" />
                        <QuickLinkCard to="/payments" icon={<CreditCard />} label="Pagamentos" colorClass="text-green-500" />
                        <QuickLinkCard to="/classes" icon={<School />} label="Turmas" colorClass="text-purple-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Payments Lists Row - Using mock data for UI structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center">
                            <ClockAlert className="mr-2 h-5 w-5 text-yellow-500" />
                            Pagamentos em Aberto (Top 3)
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild><Link to="/payments">Ver Todos</Link></Button>
                    </CardHeader>
                    <CardContent>
                        {openInvoicesCount > 0 && mockOpenPayments.length > 0 ? (
                            <ul className="space-y-2">
                                {mockOpenPayments.map(item => (
                                    <li key={item.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                                        <div>
                                            <span className="font-medium text-sm">{item.responsibleName}</span>
                                            <p className="text-xs text-muted-foreground">Vence em: {item.dueDate}</p>
                                        </div>
                                        <Badge variant="warning">R$ {item.amount}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-4 text-sm">Não há pagamentos em aberto.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center">
                           <AlarmClockOff className="mr-2 h-5 w-5 text-red-500" />
                            Pagamentos em Atraso (Top 3)
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild><Link to="/payments">Ver Todos</Link></Button>
                    </CardHeader>
                    <CardContent>
                        {lateInvoicesCount > 0 && mockLatePayments.length > 0 ? (
                             <ul className="space-y-2">
                                {mockLatePayments.map(item => (
                                    <li key={item.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                                        <div>
                                            <span className="font-medium text-sm">{item.responsibleName}</span>
                                            <p className="text-xs text-muted-foreground">Venceu em: {item.dueDate}</p>
                                        </div>
                                        <Badge variant="destructive">R$ {item.amount}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-4 text-sm">Não há pagamentos em atraso.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HomeReport;
