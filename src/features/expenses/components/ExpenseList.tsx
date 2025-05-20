import React, { useEffect, useState } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseService } from '../services/ExpenseService.ts';
import notification from '../../../components/common/Notification.tsx';
import { usePagination } from '../../../hooks/usePagination';
import { PageResponse } from '../../../types/PageResponse';
import { Expense } from '../types/ExpenseTypes.ts';

export const ExpenseList: React.FC = () => {
    const {
        currentPage,
        pageSize,
        handlePageChange,
        createEmptyPageResponse
    } = usePagination<Expense>();

    const [expensesPage, setExpensesPage] = useState<PageResponse<Expense>>(createEmptyPageResponse());
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const fetchExpenses = async () => {
        try {
            const data = await ExpenseService.getAll(currentPage, pageSize);
            setExpensesPage(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            notification('Erro ao carregar despesas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [currentPage, pageSize]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) {
            return;
        }

        try {
            await ExpenseService.delete(id);
            notification('Despesa excluída com sucesso!', 'success');
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            notification('Erro ao excluir despesa', 'error');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return <div>Carregando...</div>;
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
                                fetchExpenses();
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
                                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 0}
                                    >
                                        Primeira
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                    >
                                        Anterior
                                    </button>
                                </li>

                                {Array.from({ length: expensesPage.totalPages }, (_, i) => i + 1).map(pageNum => (
                                    <li
                                        key={pageNum}
                                        className={`page-item ${pageNum === currentPage + 1 ? 'active' : ''}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    </li>
                                ))}

                                <li className={`page-item ${currentPage === expensesPage.totalPages - 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage + 2)}
                                        disabled={currentPage === expensesPage.totalPages - 1}
                                    >
                                        Próxima
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === expensesPage.totalPages - 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(expensesPage.totalPages)}
                                        disabled={currentPage === expensesPage.totalPages - 1}
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