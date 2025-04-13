import {Button, Form} from 'react-bootstrap';
import StudentManager from '../managers/StudentManager';
import useFormValidation from '../../hooks/useFormValidation';

export const StudentFormModal: React.FC<{ parentId: string; onClose: () => void }> = ({
                                                                                       parentId,
                                                                                       onClose
                                                                                     }) => (
    <>
      <h2>Add Student</h2>
      <StudentManager responsible={parentId}/>
      <Button onClick={onClose}>Close</Button>

    </>
);

export const MonthlyFeeFormModal: React.FC<{
  onSubmit: (amount: string, dueDate: string) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const {
    validationErrors,
    isValid,
    setFieldValue,
    handleSubmit,
  } = useFormValidation({
    fieldNames: ['amount', 'dueDate'],
    initialValues: {
      amount: '',
      dueDate: '',
    },
    onSubmit: async (values) => {
      onSubmit(values.amount, values.dueDate);
    },
  });

  return (
    <>
      <h2>Add Monthly Fee</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formMonthlyFeeAmount">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="text"
            name="amount"
            onChange={setFieldValue}
            isInvalid={!!validationErrors.amount}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.amount}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formMonthlyFeeDueDate">
          <Form.Label>Due Date</Form.Label>
          <Form.Control
            type="date"
            name="dueDate"
            onChange={setFieldValue}
            isInvalid={!!validationErrors.dueDate}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.dueDate}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" disabled={!isValid()}>Save</Button>
        <Button onClick={onClose}>Close</Button>
      </Form>
    </>
  );
};