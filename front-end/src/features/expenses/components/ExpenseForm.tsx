import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { ExpenseService } from '../services/ExpenseService.ts';
import notification from '../../../components/common/Notification.tsx';
import FormField from '../../../components/common/FormField';
import { extractFieldErrors } from '../../../utils/errorUtils';

interface ExpenseFormProps {
  onSuccess?: () => void;
  initialData?: {
    date: string;
    value: number;
    description: string;
    receiptUrl?: string;
    id?: string;
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Client-side validation
    const clientErrors: Record<string, string> = {};
    if (!formData.date) clientErrors.date = "Data é obrigatória";
    if (!formData.value) clientErrors.value = "Valor é obrigatório";
    if (Number(formData.value) <= 0) clientErrors.value = "Valor deve ser maior que zero";
    if (!formData.description) clientErrors.description = "Descrição é obrigatória";

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('date', formData.date);
      data.append('value', formData.value.toString());
      data.append('description', formData.description);

      if (receipt) {
        data.append('receipt', receipt);
      }

      if (initialData) {
        await ExpenseService.update(initialData.id!, data);
        notification('Despesa atualizada com sucesso!', 'success');
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

      // Extract field-specific errors
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);

      // If there are no field-specific errors, show a general error notification
      if (Object.keys(errors).length === 0) {
        notification('Erro ao salvar despesa', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormField
        id="date"
        label="Data"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={fieldErrors.date || null}
        required
      />

      <Form.Group className="mb-3" controlId="value">
        <Form.Label>Valor</Form.Label>
        <InputGroup>
          <InputGroup.Text>R$</InputGroup.Text>
          <Form.Control
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            step="0.01"
            min="0"
            required
            isInvalid={!!fieldErrors.value}
          />
          {fieldErrors.value && (
            <Form.Control.Feedback type="invalid">
              {fieldErrors.value}
            </Form.Control.Feedback>
          )}
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3" controlId="description">
        <Form.Label>Descrição</Form.Label>
        <Form.Control
          as="textarea"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
          isInvalid={!!fieldErrors.description}
        />
        {fieldErrors.description && (
          <Form.Control.Feedback type="invalid">
            {fieldErrors.description}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-3" controlId="receipt">
        <Form.Label>Comprovante</Form.Label>
        <Form.Control
          type="file"
          onChange={(e) => setReceipt(e.target.files?.[0] || null)}
          accept="image/jpeg,image/png,application/pdf"
          isInvalid={!!fieldErrors.receipt}
        />
        <Form.Text className="text-muted">
          Formatos aceitos: JPEG, PNG e PDF. Tamanho máximo: 5MB
        </Form.Text>
        {fieldErrors.receipt && (
          <Form.Control.Feedback type="invalid">
            {fieldErrors.receipt}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
      >
        {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
      </Button>
    </Form>
  );
}; 
