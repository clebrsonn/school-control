import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { fetchParentById } from '@services/ParentService';
import { fetchStudentsByParentId } from '@services/StudentService';
import { fetchMonthlyFeesByParentId, addMonthlyFee } from '@services/MonthlyFeeService';
import StudentManager from '../managers/StudentManager';
import ErrorMessage from '@components/ErrorMessage';
import { Button, Container, Form, ListGroup, Row, Col } from 'react-bootstrap';
import { Parent, Student, MonthlyFee } from '../../models/types';

const ParentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [parent, setParent] = useState<Parent | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'monthlyFee' | null>(null);

  useEffect(() => {
    const getParent = async () => {
      try {
        const parentData = await fetchParentById(id);
        setParent(parentData);
      } catch (err) {
        setError(err.message || 'Failed to fetch parent details');
      }
    };

    const getStudents = async () => {
      try {
        const studentData = await fetchStudentsByParentId(id);
        setStudents(studentData);
      } catch (err) {
        setError(err.message || 'Failed to fetch students');
      }
    };

    const getMonthlyFees = async () => {
      try {
        const monthlyFeeData = await fetchMonthlyFeesByParentId(id);
        setMonthlyFees(monthlyFeeData);
      } catch (err) {
        setError(err.message || 'Failed to fetch monthly fees');
      }
    };

    getParent();
    getStudents();
    getMonthlyFees();
  }, [id]);

  const handleAddMonthlyFee = async () => {
    try {
      const newMonthlyFee = { amount: parseFloat(amount), dueDate, parentId: id };
      const addedMonthlyFee = await addMonthlyFee(newMonthlyFee);
      setMonthlyFees([...monthlyFees, addedMonthlyFee]);
      setAmount('');
      setDueDate('');
      setError(null);
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to add monthly fee');
    }
  };

  const openModal = (type: 'student' | 'monthlyFee') => {
    setModalType(type);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!parent) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Parent Details</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => openModal('student')} className="me-2">
            Add Student
          </Button>
          <Button variant="primary" onClick={() => openModal('monthlyFee')}>
            Add Monthly Fee
          </Button>
        </Col>
      </Row>

      <p>Name: {parent.nome}</p>
      <p>ID: {parent._id}</p>
      {/* Adicione mais detalhes conforme necessário */}

      <h2>Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student._id}>{student.nome}</li>
        ))}
      </ul>

      <h2>Monthly Fees</h2>
      <ListGroup className="mt-3">
        {monthlyFees.map((monthlyFee) => (
          <ListGroup.Item key={monthlyFee._id}>
            {monthlyFee.amount} - {monthlyFee.dueDate} - {monthlyFee.isPaid ? 'Paid' : 'Unpaid'}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Information"
      >
        {modalType === 'student' && (
          <>
            <h2>Add Student</h2>
            <StudentManager parentId={id} closeModal={closeModal} />
          </>
        )}
        {modalType === 'monthlyFee' && (
          <>
            <h2>Add Monthly Fee</h2>
            <Form>
              <Form.Group controlId="formMonthlyFeeAmount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Amount"
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
              <Button variant="primary" onClick={handleAddMonthlyFee} className="mt-3">
                Save
              </Button>
            </Form>
          </>
        )}
        <Button onClick={closeModal} className="mt-3">Close</Button>
      </Modal>
    </Container>
  );
};

export default ParentDetails;