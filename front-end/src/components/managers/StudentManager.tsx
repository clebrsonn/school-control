import React, { useState, useEffect } from 'react';
import { fetchStudents, addStudent } from '@services/StudentService';
import { Link } from 'react-router-dom';
import ErrorMessage from '@components/ErrorMessage';
import { Button, Container, Form, ListGroup } from 'react-bootstrap';

interface StudentManagerProps {
  parentId: string | undefined;
  closeModal: () => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ parentId, closeModal }) => {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStudents = async () => {
      try {
        const students = await fetchStudents();
        setStudents(students);
      } catch (err) {
        setError(err.message || 'Failed to fetch students');
      }
    };
    getStudents();
  }, []);

  const handleAddStudent = async () => {
    try {
      const newStudent = { nome: name, parentId };
      const addedStudent = await addStudent(newStudent);
      setStudents([...students, addedStudent]);
      setName('');
      setError(null);
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to add student');
    }
  };

  return (
    <Container>
      <h1>Gerenciar Alunos</h1>
      <ErrorMessage message={error} />
      <Form>
        <Form.Group controlId="formStudentName">
          <Form.Label>Nome do Aluno</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nome do Aluno"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleAddStudent}>
          Salvar
        </Button>
      </Form>
      <ListGroup className="mt-3">
        {students.map((student: any) => (
          <ListGroup.Item key={student._id}>
            <Link to={`/students/${student._id}`}>{student.nome}</Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default StudentManager;