import StudentManager from "../managers/StudentManager.tsx";
import {Button, Form} from "react-bootstrap";
import {useState} from "react";

export const StudentFormModal: React.FC<{ parentId: string; onClose: () => void }> = ({
  parentId,
  onClose
}) => (
  <>
    <h2>Add Student</h2>
    <StudentManager responsible={parentId} />
    <Button onClick={onClose}>Close</Button>

  </>
);

export const MonthlyFeeFormModal: React.FC<{
  onSubmit: (amount: string, dueDate: string) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  return (
    <>
      <h2>Add Monthly Fee</h2>
      <Form>
        <Form.Group controlId="formMonthlyFeeAmount">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formMonthlyFeeDueDate">
          <Form.Label>Due Date</Form.Label>
          <Form.Control
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Form.Group>
        <Button onClick={() => onSubmit(amount, dueDate)}>Save</Button>
        <Button onClick={onClose}>Close</Button>
      </Form>
    </>
  );
};