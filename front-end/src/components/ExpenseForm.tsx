import React, { useState } from 'react';
import { ExpenseService } from '@services/ExpenseService';
import notification from '@components/Notification';

interface ExpenseFormProps {
  onSuccess?: () => void;
  initialData?: {
    date: string;
    value: number;
    description: string;
    receiptUrl?: string;
  };
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    value: initialData?.value || '',
    description: initialData?.description || '',
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('date', formData.date);
      data.append('value', formData.value.toString());
      data.append('description', formData.description);
      
      if (receipt) {
        data.append('receipt', receipt);
      }

      if (initialData) {
        await ExpenseService.update(initialData._id!, data);
        notification('Despesa atualizada com sucesso!');
      } else {
        await ExpenseService.create(data);
        notification('Despesa cadastrada com sucesso!', 'success');
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        value: '',
        description: '',
      });
      setReceipt(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving expense:', error);
      notification('Erro ao salvar despesa', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="mb-3">
        <label htmlFor="date" className="form-label">
          Data
        </label>
        <input
          type="date"
          className="form-control"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="value" className="form-label">
          Valor
        </label>
        <div className="input-group">
          <span className="input-group-text">R$</span>
          <input
            type="number"
            className="form-control"
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Descrição
        </label>
        <textarea
          className="form-control"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="receipt" className="form-label">
          Comprovante
        </label>
        <input
          type="file"
          className="form-control"
          id="receipt"
          onChange={(e) => setReceipt(e.target.files?.[0] || null)}
          accept="image/jpeg,image/png,application/pdf"
        />
        <div className="form-text">
          Formatos aceitos: JPEG, PNG e PDF. Tamanho máximo: 5MB
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
      </button>
    </form>
  );
}; 