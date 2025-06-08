import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExpenseForm } from './ExpenseForm.tsx';
import { ExpenseService } from '../services/ExpenseService.ts';
import notification from '../../../components/common/Notification.tsx';
import { Expense, PageResponse } from '../types/ExpenseTypes.ts'; // Assuming PageResponse is here or imported elsewhere
import { ExpenseFormData } from '../types/expenseSchemas.ts'; // For type safety with form data

// Shadcn/UI Imports
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.tsx';
import ErrorMessage from '../../../components/common/ErrorMessage.tsx';
import { PlusCircle, Edit3, Trash2, FileText } from 'lucide-react';
import { extractFieldErrors } from '../../../utils/errorUtils.ts';


export const ExpenseList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const queryClient = useQueryClient();

    const {
        data: expensesPage,
        isLoading,
        error,
        refetch, // Keep refetch for manual refresh if needed
    } = useQuery<PageResponse<Expense>, Error>({
        queryKey: ['expenses', currentPage, pageSize],
        queryFn: () => ExpenseService.getAll(currentPage, pageSize),
        keepPreviousData: true,
    });

    const createExpenseMutation = useMutation<Expense, Error, FormData>({
        mutationFn: (formData) => ExpenseService.create(formData),
        onSuccess: () => {
            notification('Despesa cadastrada com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['expenses', currentPage] });
            setIsFormOpen(false);
            setEditingExpense(null);
        },
        onError: (err: any) => {
            // More specific error handling can be done in ExpenseForm based on API response
            notification('Erro ao cadastrar despesa: ' + (err.message || 'Verifique os dados'), 'error');
        }
    });

    const updateExpenseMutation = useMutation<Expense, Error, { id: string; formData: FormData }>({
        mutationFn: ({ id, formData }) => ExpenseService.update(id, formData),
        onSuccess: () => {
            notification('Despesa atualizada com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['expenses', currentPage] });
            setIsFormOpen(false);
            setEditingExpense(null);
        },
        onError: (err: any) => {
            notification('Erro ao atualizar despesa: ' + (err.message || 'Verifique os dados'), 'error');
        }
    });

    const deleteExpenseMutation = useMutation<void, Error, string>({
        mutationFn: (id: string) => ExpenseService.delete(id),
        onSuccess: () => {
            notification('Despesa excluída com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['expenses', currentPage] });
        },
        onError: (error: any) => {
            notification('Erro ao excluir despesa: ' + (error.message || 'Erro desconhecido'), 'error');
        }
    });

    const handleOpenFormForCreate = () => {
        setEditingExpense(null);
        setIsFormOpen(true);
    };

    const handleOpenFormForEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleFormSubmitSuccess = () => {
        setIsFormOpen(false);
        setEditingExpense(null);
        // Data is refetched by mutation's onSuccess
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setEditingExpense(null);
    };

    const handleDelete = (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
        deleteExpenseMutation.mutate(id);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    if (isLoading && !expensesPage) {
        return <LoadingSpinner fullScreen />;
    }
    if (error && !expensesPage) {
        return <ErrorMessage message={`Erro ao carregar despesas: ${error.message}`} title="Erro de Carregamento" />;
    }

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Despesas</h2>
                <Button onClick={handleOpenFormForCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Despesa
                </Button>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
                        <DialogDescription>
                            {editingExpense ? 'Atualize os detalhes da despesa.' : 'Preencha os detalhes da nova despesa.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ExpenseForm
                        // key={editingExpense ? editingExpense.id : 'new'} // To force re-render and reset form state on new/edit
                        initialData={editingExpense || undefined}
                        onSuccess={handleFormSubmitSuccess} // ExpenseForm will call its own mutation now based on internal logic
                        onCancel={handleFormCancel}
                        // Pass create/update mutations to ExpenseForm if it does not define its own
                        // createMutation={createExpenseMutation}
                        // updateMutation={updateExpenseMutation}
                    />
                </DialogContent>
            </Dialog>


            <Card>
                <CardHeader>
                    <CardTitle>Lista de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && expensesPage && <div className="text-center p-4"><LoadingSpinner/></div>}
                    {!isLoading && error && <ErrorMessage message={`Erro ao carregar despesas: ${error.message}`}/>}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Comprovante</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expensesPage && expensesPage.content.length > 0 ? (
                                expensesPage.content.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{formatDate(expense.date)}</TableCell>
                                        <TableCell>{formatCurrency(expense.value)}</TableCell>
                                        <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                                        <TableCell>{expense.category || '-'}</TableCell>
                                        <TableCell>
                                            {expense.receiptUrl ? (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                                                        <FileText className="mr-2 h-3 w-3" /> Ver
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="icon" onClick={() => handleOpenFormForEdit(expense)}>
                                                <Edit3 className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDelete(expense.id!)}
                                                disabled={deleteExpenseMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Excluir</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        Nenhuma despesa encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {expensesPage && expensesPage.totalPages > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(0)}
                                        disabled={expensesPage.number === 0}
                                    >
                                        Primeira
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#" // href is not strictly needed if onClick is handled
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(0, prev - 1)); }}
                                        className={expensesPage.number === 0 ? "pointer-events-none opacity-50" : undefined}
                                    />
                                </PaginationItem>

                                {/* Simple page numbers, can be made more complex with ellipsis */}
                                {[...Array(expensesPage.totalPages).keys()].map(pageIdx => (
                                     <PaginationItem key={pageIdx}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(pageIdx);}}
                                            isActive={currentPage === pageIdx}
                                        >
                                            {pageIdx + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(expensesPage.totalPages - 1, prev + 1));}}
                                        className={expensesPage.number === expensesPage.totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                     <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(expensesPage.totalPages - 1)}
                                        disabled={expensesPage.number === expensesPage.totalPages - 1}
                                     >
                                        Última
                                     </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
