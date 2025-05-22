import { Button, Form } from 'react-bootstrap';
import React, { useState } from 'react'; // Ensured React is imported for React.FC
import { useTranslation } from 'react-i18next'; // Import useTranslation

/**
 * @interface MonthlyFeeFormModalProps
 * Props for the MonthlyFeeFormModal component.
 */
interface MonthlyFeeFormModalProps {
  /**
   * Callback function triggered when the form is submitted with the amount and due date.
   * @param {string} amount - The amount entered for the monthly fee.
   * @param {string} dueDate - The due date selected for the monthly fee.
   */
  onSubmit: (amount: string, dueDate: string) => void;
  /**
   * Callback function triggered when the modal is requested to be closed.
   */
  onClose: () => void;
}

/**
 * MonthlyFeeFormModal is a component that renders a form within a modal (modal structure provided by parent)
 * for adding a monthly fee. It includes fields for amount and due date.
 *
 * @param {MonthlyFeeFormModalProps} props - The props for the component.
 * @returns {React.ReactElement} The MonthlyFeeFormModal form content.
 */
export const MonthlyFeeFormModal: React.FC<MonthlyFeeFormModalProps> = ({ onSubmit, onClose }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // It's good practice to handle form submission with a dedicated function
  // if any validation or more complex logic were to be added before calling onSubmit.
  const handleSubmit = () => {
    onSubmit(amount, dueDate);
  };

  return (
    <>
      <h2>{t('modals.monthlyFeeForm.title')}</h2>
      <Form> {/* Consider adding onSubmit={handleSubmit} to the Form tag if it were a full form submission */}
        <Form.Group controlId="formMonthlyFeeAmount" className="mb-3">
          <Form.Label>{t('modals.monthlyFeeForm.labels.amount')}</Form.Label>
          <Form.Control
            type="number" // Changed to number for better input semantics
            name="amount"  // Added name attribute
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('modals.monthlyFeeForm.placeholders.amount')} // Added placeholder
          />
        </Form.Group>
        <Form.Group controlId="formMonthlyFeeDueDate" className="mb-3">
          <Form.Label>{t('modals.monthlyFeeForm.labels.dueDate')}</Form.Label>
          <Form.Control
            type="date"
            name="dueDate" // Added name attribute
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSubmit} className="me-2"> {/* Added variant and margin */}
          {t('modals.monthlyFeeForm.buttons.save')}
        </Button>
        <Button variant="secondary" onClick={onClose}> {/* Added variant */}
          {t('modals.monthlyFeeForm.buttons.close')}
        </Button>
      </Form>
    </>
  );
};

