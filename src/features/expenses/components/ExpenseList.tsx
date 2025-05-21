import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ExpenseForm } from './ExpenseForm.tsx';
import { ExpenseService } from '../services/ExpenseService.ts';
import notification from '../../../components/common/Notification.tsx';
import { Expense } from '../types/ExpenseTypes.ts';

export const ExpenseList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const queryClient = useQueryClient();

    // Busca despesas paginadas
    const {
        data: expensesPage = { content: [], number: 0, totalPages: 1, size: pageSize },
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['expenses', currentPage, pageSize],
        queryFn: () => ExpenseService.getAll(currentPage, pageSize),
        keepPreviousData: true
    });

    // Mutation para deletar despesa
    const deleteMutation = useMutation({
        mutationFn: (id: string) => ExpenseService.delete(id),
        onSuccess: () => {
            notification('Despesa excluída com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
        onError: () => {
            notification('Erro ao excluir despesa', 'error');
        }
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
        deleteMutation.mutate(id);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    if (isLoading) {
        return <div>Carregando...</div>;
    }
    if (error) {
        return <div className="text-danger">Erro ao carregar despesas.</div>;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Despesas</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingExpense(null);
                        setShowForm(true);
                    }}
                >
                    Nova Despesa
                </button>
            </div>

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">
                            {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                        </h5>
                        <ExpenseForm
                            initialData={editingExpense ? {
                                date: new Date(editingExpense.date).toISOString().split('T')[0],
                                value: editingExpense.value,
                                description: editingExpense.description,
                                receiptUrl: editingExpense.receiptUrl,
                                id: editingExpense.id
                            } : undefined}
                            onSuccess={() => {
                                setShowForm(false);
                                refetch();
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Descrição</th>
                        <th>Comprovante</th>
                        <th>Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {expensesPage.content && expensesPage.content.map((expense) => (
                        <tr key={expense.id}>
                            <td>{formatDate(expense.date)}</td>
                            <td>{formatCurrency(expense.value)}</td>
                            <td>{expense.description}</td>
                            <td>
                                {expense.receiptUrl ? (
                                    <a
                                        href={expense.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        Ver
                                    </a>
                                ) : (
                                    <span className="text-muted">Nenhum</span>
                                )}
                            </td>
                            <td>
                                <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => {
                                        setEditingExpense(expense);
                                        setShowForm(true);
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(expense.id!)}
                                    disabled={deleteMutation.isLoading}
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {expensesPage.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${expensesPage.number === 0 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(0)}
                                        disabled={expensesPage.number === 0}
                                    >
                                        Primeira
                                    </button>
                                </li>
                                <li className={`page-item ${expensesPage.number === 0 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(expensesPage.number - 1)}
                                        disabled={expensesPage.number === 0}
                                    >
                                        Anterior
                                    </button>
                                </li>

                                {Array.from({ length: expensesPage.totalPages }, (_, i) => i + 1).map(pageNum => (
                                    <li
                                        key={pageNum}
                                        className={`page-item ${pageNum === expensesPage.number + 1 ? 'active' : ''}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(pageNum - 1)}
                                        >
                                            {pageNum}
                                        </button>
                                    </li>
                                ))}

                                <li className={`page-item ${expensesPage.number === expensesPage.totalPages - 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(expensesPage.number + 1)}
                                        disabled={expensesPage.number === expensesPage.totalPages - 1}
                                    >
                                        Próxima
                                    </button>
                                </li>
                                <li className={`page-item ${expensesPage.number === expensesPage.totalPages - 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(expensesPage.totalPages - 1)}
                                        disabled={expensesPage.number === expensesPage.totalPages - 1}
                                    >
                                        Última
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

