import React, { useEffect, useState } from 'react';
import { Button, Container, Form, ListGroup } from 'react-bootstrap';
import ErrorMessage from '../common/ErrorMessage';
import { ITuition } from '@hyteck/shared';
import {
  createPayment,
  groupPaymentsByMonthAndParent,
} from '../../features/payments/services/PaymentService';
import useFormValidation from '../../hooks/useFormValidation.ts';
import notification from '../common/Notification.tsx';
import EntityTable from '../../components/common/ListRegistries';
const PaymentManager: React.FC = () => {
  const [groupedPayments, setGroupedPayments] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    validateField,
    validateForm,
    setFieldValue,
    validationErrors,
    isSubmitted,
    onSubmitted,
    clearErrors,
  } = useFormValidation<Partial<ITuition>>({
    fieldNames: ['amount', 'dueDate', 'parentId', 'classId', 'discountId'],
    validationErrors: { amount: '', dueDate: '', parentId: '', classId: '', discountId: '' },
  });

  useEffect(() => {
    const getPayments = async () => {
      try {
        const grouped = await groupPaymentsByMonthAndParent();
        setGroupedPayments(grouped || []);
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch payments');
      }
    };
    getPayments();
  }, []);

  const handleAddPayment = async () => {
    onSubmitted();
    if (!validateForm() || !selectedGroup) {
      return;
    }
    try {
      const newPayment: Partial<ITuition> = {
        amount: Number(setFieldValue('amount', '')),
        dueDate: setFieldValue('dueDate', ''),
        responsible: selectedGroup.responsible._id,
        enrollment: selectedGroup.enrollment._id,
      };

      const createdPayment = await createPayment(newPayment);

      setGroupedPayments((prev) =>
        prev.map((group) =>
          group.year === selectedGroup.year && group.month === selectedGroup.month
            ? {
              ...group,
              payments: [...(group.payments || []), createdPayment],
            }
            : group,
        ),
      );
      notification('Payment added successfully', 'success');
      clearErrors();
    } catch (err) {
      setError((err as Error).message || 'Failed to add payment');
    }
  };

  const handleGroupSelect = (group: any) => {
    setSelectedGroup(group);
  };

  const renderGroupedPayments = () =>
    groupedPayments.map((group) => (
      <div key={`${group.year}-${group.month}-${group.responsible}`}>
        <h3>{`${group.month}/${group.year} - ${group.responsible.name}`}</h3>
        <p>Total Amount: {group.totalAmount}</p>
        <Button
          variant="primary"
          onClick={() => {
            handleGroupSelect(group);
            handleAddPayment();
          }}
          className="mt-3"
          disabled={!validateForm() || !group.responsible._id}
        >
          Add Payment
        </Button>
        <EntityTable
          data={group.payments || []}
          entityName="payment"
          columns={[
            {
              header: 'Amount',
              accessor: 'amount',
            },
            {
              header: 'Due Date',
              accessor: 'dueDate',
            },
          ]}
        />
      </div>

    ));

  return (
    <Container className="bg-dark text-white p-4">
      <h1>Gerenciar Pagamentos</h1>
      {error && <ErrorMessage message={error} />}
      <Form>
        <Form.Group controlId="formPaymentAmount">
          <Form.Label>Valor</Form.Label>
          <Form.Control
            type="number"
            placeholder="Valor"
            name="amount"
            value={setFieldValue('amount', '')}
            onChange={(e) => setFieldValue('amount', e.target.value)}
            onBlur={() => validateField('amount', setFieldValue('amount', ''), true)}
            isInvalid={!!validationErrors.amount && isSubmitted}
          />
          {validationErrors.amount && isSubmitted && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.amount}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group controlId="formPaymentDate">
          <Form.Label>Data</Form.Label>
          <Form.Control
            type="date"
            name="dueDate"
            value={setFieldValue('dueDate', '')}
            onChange={(e) => setFieldValue('dueDate', e.target.value)}
            onBlur={() => validateField('dueDate', setFieldValue('dueDate', ''), true)}
            isInvalid={!!validationErrors.dueDate && isSubmitted}
          />
          {validationErrors.dueDate && isSubmitted && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.dueDate}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Form>
      {renderGroupedPayments()}
    </Container>
  );
};

export default PaymentManager;