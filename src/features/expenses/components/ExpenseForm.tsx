import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ExpenseService } from '../services/ExpenseService.ts';
import notification from '../../../components/common/Notification.tsx';
import FormField from '../../../components/common/FormField';
import { extractFieldErrors } from '../../../utils/errorUtils';
import { Expense } from '../types/ExpenseTypes.ts';

/**
 * @interface ExpenseFormProps
 * Props for the ExpenseForm component.
 */
interface ExpenseFormProps {
  /** Optional callback function triggered on successful form submission. */
  onSuccess?: () => void;
  /** Optional initial data for editing an existing expense. */
  initialData?: Expense;
}

/**
 * ExpenseForm is a component for creating or editing expenses.
 * It includes fields for date, value, description, and an optional receipt upload.
 * Handles client-side validation and communicates with ExpenseService for backend operations.
 *
 * @param {ExpenseFormProps} props - The props for the component.
 * @returns {React.ReactElement} The ExpenseForm component.
 */
export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, initialData }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    value: initialData?.value?.toString() || '', // Store as string for form input
    description: initialData?.description || '',
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Effect to update form when initialData changes (e.g., when used in an edit modal)
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        value: initialData.value?.toString() || '',
        description: initialData.description || '',
      });
      setReceipt(null); // Reset receipt on initial data change
    }
  }, [initialData]);


  /**
   * Handles the form submission for creating or updating an expense.
   * Performs client-side validation and makes an API call.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Client-side validation
    const clientErrors: Record<string, string> = {};
    if (!formData.date) clientErrors.date = t('expenses.form.validations.dateRequired');
    if (!formData.value) clientErrors.value = t('expenses.form.validations.valueRequired');
    const numericValue = parseFloat(formData.value);
    if (isNaN(numericValue) || numericValue <= 0) clientErrors.value = t('expenses.form.validations.valuePositive');
    if (!formData.description) clientErrors.description = t('expenses.form.validations.descriptionRequired');

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setLoading(false);
      return;
    }

    try {
      const dataPayload = new FormData(); // Use FormData for file uploads
      dataPayload.append('date', formData.date);
      dataPayload.append('value', numericValue.toString()); // Send numeric value as string
      dataPayload.append('description', formData.description);

      if (receipt) {
        dataPayload.append('receipt', receipt);
      }

      if (initialData && initialData.id) { // Ensure initialData and its id are present for update
        await ExpenseService.update(initialData.id, dataPayload);
        notification(t('expenses.form.notifications.updateSuccess'), 'success');
      } else {
        await ExpenseService.create(dataPayload);
        notification(t('expenses.form.notifications.createSuccess'), 'success');
      }

      // Reset form state
      setFormData({
        date: new Date().toISOString().split('T')[0],
        value: '',
        description: '',
      });
      setReceipt(null);
      // Clear file input visually (this is a common challenge, direct value set is not allowed for security)
      const fileInput = document.getElementById('receipt') as HTMLInputElement;
      if (fileInput) fileInput.value = ''; 
      
      onSuccess?.(); // Call onSuccess callback if provided
    } catch (error: any) {
      console.error('Error saving expense:', error);
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);

      if (Object.keys(errors).length === 0) {
        notification(t('expenses.form.notifications.saveError'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormField
        id="date"
        name="date"
        label={t('expenses.form.labels.date')}
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={fieldErrors.date || null}
        required
      />

      <Form.Group className="mb-3" controlId="value">
        <Form.Label>{t('expenses.form.labels.value')}</Form.Label>
        <InputGroup>
          <InputGroup.Text>R$</InputGroup.Text>
          <Form.Control
            name="value" // Add name attribute for consistency if FormField was directly used
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            step="0.01"
            min="0"
            placeholder={t('expenses.form.placeholders.value')} // Added placeholder
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
        <Form.Label>{t('expenses.form.labels.description')}</Form.Label>
        <Form.Control
          name="description" // Add name attribute
          as="textarea"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder={t('expenses.form.placeholders.description')} // Added placeholder
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
        <Form.Label>{t('expenses.form.labels.receipt')}</Form.Label>
        <Form.Control
          name="receipt" // Add name attribute
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceipt(e.target.files?.[0] || null)}
          accept="image/jpeg,image/png,application/pdf"
          isInvalid={!!fieldErrors.receipt}
        />
        <Form.Text className="text-muted">
          {t('expenses.form.receiptHelpText')}
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
        {loading 
            ? t('expenses.form.buttons.saving') 
            : initialData 
                ? t('expenses.form.buttons.update') 
                : t('expenses.form.buttons.save')}
      </Button>
    </Form>
  );
}; 
