import React, { useEffect, useState } from 'react';
import { IExpense } from '@hyteck/shared/';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseService } from '../services/ExpenseService.ts';
import notification from '../../../components/common/Notification.tsx';

export const ExpenseList: React.FC = () => {
    const [expenses, setExpenses] = useState<IExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);

    const fetchExpenses = async () => {
        try {
            const data = await ExpenseService.getAll();
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            notification('Erro ao carregar despesas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

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
                                receiptUrl: editingExpense.receiptUrl
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
                {expenses && (<table className="table table-striped">
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
                    {expenses.map((expense) => (
                        <tr key={expense._id}>
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
                                    onClick={() => handleDelete(expense._id!)}
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>)}
            </div>
        </div>
    );
}; 