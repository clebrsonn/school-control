import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

import { getResponsibleById, getStudentsByResponsibleId } from '../../features/parents/services/ParentService.ts';
import { ResponsibleResponse } from '../../features/parents/types/ResponsibleTypes.ts';
import { StudentResponse, PageResponse as StudentPageResponse } from '../../features/students/types/StudentTypes.ts'; // Assuming Student types include PageResponse

import { getPaymentsByResponsible, processPayment } from '../../features/payments/services/PaymentService.ts';
import { PaymentMethod, PaymentRequest, PaymentResponse } from '../../features/payments/types/PaymentTypes.ts'; // PageResponse for payments?
import { getConsolidatedStatement } from '../../features/billing/services/BillingService.ts';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes.ts';

import StudentManager from '../managers/StudentManager.tsx'; // Already refactored

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Users, CreditCard, PlusCircle, Edit3, Trash2, FileText, Mail, Phone, HomeIcon } from 'lucide-react'; // Using HomeIcon for generic address

interface PageResponse<T> { // Generic PageResponse if not already defined globally
    content: T[];
    number: number;
    totalPages: number;
    size: number;
    totalElements: number;
}


const ParentDetails: React.FC = () => {
    const { id: parentId } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);

    const currentDate = new Date();
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Query for Parent Details
    const { data: parent, isLoading: isLoadingParent, error: errorParent } = useQuery<ResponsibleResponse, Error>({
        queryKey: ['parent', parentId],
        queryFn: () => fetchParentById(parentId!), // Corrected function name
        enabled: !!parentId,
    });

    // Query for Students of this Parent
    const { data: studentsData, isLoading: isLoadingStudents, error: errorStudents } = useQuery<StudentPageResponse<StudentResponse>, Error>({
        queryKey: ['studentsByParent', parentId],
        queryFn: () => getStudentsByResponsibleId(parentId!, { page: 0, size: 100 }), // Assuming it returns PageResponse
        enabled: !!parentId,
    });
    const students = studentsData?.content || [];

    // Query for Payments made by this Parent
    const { data: payments = [], isLoading: isLoadingPayments, error: errorPayments } = useQuery<PaymentResponse[], Error>({
        queryKey: ['paymentsByParent', parentId],
        queryFn: () => getPaymentsByResponsible(parentId!),
        enabled: !!parentId,
    });

    // Query for Consolidated Statement for this Parent
    const {
        data: consolidatedStatement,
        isLoading: isLoadingStatement,
        error: errorStatement,
        refetch: refetchConsolidatedStatement
    } = useQuery<ConsolidatedStatement, Error>({
        queryKey: ['consolidatedStatement', parentId, yearMonth],
        queryFn: () => getConsolidatedStatement(parentId!, yearMonth),
        enabled: !!parentId,
    });

    const processPaymentMutation = useMutation<void, Error, PaymentRequest >({
        mutationFn: processPayment,
        onSuccess: () => {
            notification('Pagamento processado com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['consolidatedStatement', parentId, yearMonth] });
            queryClient.invalidateQueries({ queryKey: ['paymentsByParent', parentId] }); // Also refetch payments list
        },
        onError: (err: Error) => {
            notification(err.message || 'Erro ao processar o pagamento.', 'error');
        }
    });

    const handleProcessPayment = (item: StatementLineItem) => {
        if (!item.invoiceId) {
            notification('ID da fatura não encontrado.', 'error');
            return;
        }
        const paymentRequest: PaymentRequest = {
            invoiceId: item.invoiceId,
            amount: item.amount,
            paymentMethod: PaymentMethod.PIX, // Defaulting, could be dynamic
            paymentDate: new Date(),
        };
        processPaymentMutation.mutate(paymentRequest);
    };

    const groupPaymentsByMonth = (paymentsList: PaymentResponse[]): { [month: string]: PaymentResponse[] } => {
        return paymentsList.reduce((acc, payment) => {
            const month = new Date(payment.paymentDate).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            if (!acc[month]) acc[month] = [];
            acc[month].push(payment);
            return acc;
        }, {} as { [month: string]: PaymentResponse[] });
    };
    const groupedPayments = groupPaymentsByMonth(payments);

    const formatDate = (dateString: string | Date | undefined): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatCurrency = (value: number | undefined) => {
        if (value == null) return 'N/A';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (isLoadingParent || (parentId && !parent && !errorParent)) { // Show loading if parentId is present but parent data not yet fetched
      return <LoadingSpinner fullScreen />;
    }
    if (errorParent) return <ErrorMessage message={`Erro ao carregar detalhes do responsável: ${errorParent.message}`} />;
    if (!parent) return <ErrorMessage message="Responsável não encontrado." />;


    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold flex items-center">
                    <User className="mr-3 h-8 w-8 text-primary" />
                    Detalhes do Responsável
                </h1>
                {/* Optional: Add Edit button for parent here if functionality exists */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-full bg-primary/10 text-primary"><User className="h-5 w-5" /></div>
                        <div>
                            <p className="text-sm text-muted-foreground">Nome</p>
                            <p className="font-medium">{parent.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500"><Mail className="h-5 w-5" /></div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{parent.email || 'Não informado'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-500"><Phone className="h-5 w-5" /></div>
                        <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <p className="font-medium">{parent.phone || 'Não informado'}</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-3 md:col-span-2 lg:col-span-1">
                        <div className="p-3 rounded-full bg-purple-500/10 text-purple-500"><HomeIcon className="h-5 w-5" /></div>
                        <div>
                            <p className="text-sm text-muted-foreground">Endereço</p>
                            <p className="font-medium">{parent.address || 'Não informado'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-blue-600" />
                        Alunos Vinculados
                    </CardTitle>
                    <Dialog open={isStudentManagerOpen} onOpenChange={setIsStudentManagerOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setIsStudentManagerOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Aluno
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                                <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                            </DialogHeader>
                            {/* StudentManager is already refactored and should handle its own form and submission */}
                            <StudentManager responsible={parentId} />
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {isLoadingStudents && <LoadingSpinner />}
                    {errorStudents && <ErrorMessage message={`Erro ao carregar alunos: ${errorStudents.message}`} />}
                    {!isLoadingStudents && !errorStudents && students.length > 0 ? (
                        <ul className="space-y-2">
                            {students.map((student) => (
                                <li key={student.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                                    <div className="flex items-center space-x-3">
                                        <GraduationCap className="h-5 w-5 text-blue-500" />
                                        <Link to={`/students/${student.id}`} className="font-medium hover:underline">
                                            {student.name}
                                        </Link>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/students/${student.id}`}>Ver Detalhes</Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !isLoadingStudents && <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno cadastrado para este responsável.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-green-600" />
                        Pagamentos Realizados
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingPayments && <LoadingSpinner />}
                    {errorPayments && <ErrorMessage message={`Erro ao carregar pagamentos: ${errorPayments.message}`} />}
                    {!isLoadingPayments && !errorPayments && Object.keys(groupedPayments).length > 0 ? (
                        Object.entries(groupedPayments).map(([month, monthPayments]) => (
                            <div key={month} className="mb-6">
                                <h3 className="text-md font-semibold mb-2">{month}</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead>Fatura ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthPayments.map(payment => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                                                <TableCell>{payment.paymentMethod}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{payment.invoiceId}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))
                    ) : (
                       !isLoadingPayments && <p className="text-sm text-muted-foreground text-center py-4">Nenhum pagamento registrado.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-orange-500" />
                        Fatura Atual em Aberto ({yearMonth})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingStatement && <LoadingSpinner />}
                    {errorStatement && <ErrorMessage message={`Erro ao carregar fatura: ${errorStatement.message}`} />}
                    {!isLoadingStatement && !errorStatement && consolidatedStatement ? (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">
                                Total Devido: {formatCurrency(consolidatedStatement.totalAmountDue)}
                            </h3>
                            {consolidatedStatement.totalAmountDue > 0 && <p className="text-sm text-muted-foreground mb-3">Itens pendentes:</p>}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Aluno</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consolidatedStatement.items.filter(item => item.amount > 0).map((item: StatementLineItem) => (
                                        <TableRow key={item.invoiceId + item.description}>
                                            <TableCell>{item.studentName}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                                            <TableCell>{formatDate(item.dueDate)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleProcessPayment(item)}
                                                    disabled={processPaymentMutation.isPending}
                                                >
                                                    {processPaymentMutation.isPending && processPaymentMutation.variables?.invoiceId === item.invoiceId
                                                        ? 'Processando...'
                                                        : 'Pagar Item (PIX)'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {consolidatedStatement.items.filter(item => item.amount > 0).length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center">Nenhum item pendente nesta fatura.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        !isLoadingStatement && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fatura em aberto para este período.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ParentDetails;
