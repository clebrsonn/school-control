import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchStudentById, enrollStudent } from '@services/StudentService';
import { fetchClasses } from '@services/ClassService';
import { IStudent, IClass } from '@hyteck/shared';
import { Button, Form, Container } from 'react-bootstrap';
import ErrorMessage from '@components/ErrorMessage';
import notification from '../Notification';

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<IStudent | null>(null);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStudent = async () => {
      try {
        const studentData = await fetchStudentById(id);
        setStudent(studentData);
      } catch (err) {
        console.error(err);
      }
    };

    const getClasses = async () => {
      try {
        const classData = await fetchClasses();
        setClasses(classData);
      } catch (err) {
        console.error(err);
      }
    };

    getStudent();
    getClasses();
  }, [id]);

  const handleEnroll = async () => {
    try {
      if (!selectedClassId) {
        setError('Por favor, selecione uma turma.');
        return;
      }
      await enrollStudent(id, selectedClassId);
      setError(null);
      notification('Aluno matriculado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Failed to enroll student');
    }
  };

  const handleAdjustTime = async () => {
    try {
      // Lógica para ajustar o horário do aluno
      // Exemplo: Atualizar o horário no backend
      alert('Horário ajustado com sucesso!');
    } catch (err) {
      setError(err.message || 'Failed to adjust time');
    }
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h2>Student Details</h2>
      <p>Name: {student.name}</p>
      <p>Parent: <Link to={`/parents/${student.responsible._id}`}>{student.responsible.name}</Link></p>
      {error && <ErrorMessage message={error} />}
      <Form>
        <Form.Group controlId="formClassSelect">
          <Form.Label>Selecione uma Turma</Form.Label>
          <Form.Control
            as="select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Selecione uma turma</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button variant="primary" onClick={handleEnroll} className="mt-3">
          Matricular
        </Button>
      </Form>
    </Container>
  );
};

export default StudentDetails;