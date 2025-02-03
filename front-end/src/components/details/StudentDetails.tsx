import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchStudentById, enrollStudent } from '@services/StudentService';
import { fetchClasses } from '@services/ClassService';
import { IStudent, IEnrollment, IClass } from '@hyteck/shared';
import { Button, Form, Container } from 'react-bootstrap';
import ErrorMessage from '@components/ErrorMessage';
import notification from '../Notification';
import {fetchEnrollmentByStudent} from "../../services/MonthlyFeeService.ts";

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<IStudent | null>(null);
  const [enrollment, setEnrollment] = useState<IEnrollment[] | null>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStudentAndEnrollment = async () => {
      try {
        // Busca os dados do estudante
        const studentData = await fetchStudentById(id);
        setStudent(studentData);

        // Busca a matrícula do estudante
        const enrollmentData = await fetchEnrollmentByStudent(id as string);
        setEnrollment(enrollmentData);
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

    getStudentAndEnrollment();
    getClasses();
  }, [id]);

  const handleEnroll = async () => {
    try {
      if (!selectedClassId) {
        setError('Por favor, selecione uma turma.');
        return;
      }

      // Realiza a matrícula ou atualiza a turma
      await enrollStudent(id, selectedClassId);
      setError(null);
      notification('Aluno matriculado ou atualizado com sucesso!');

      // Atualiza a matrícula e dados do estudante
      const updatedEnrollment = await fetchEnrollmentByStudent(id);
      setEnrollment(updatedEnrollment);
    } catch (err: any) {
      setError(err.message || 'Falha ao matricular aluno.');
    }
  };

  if (!student) {
    return <div>Carregando...</div>;
  }

  const isEnrolled = !!enrollment; // Verifica se o aluno possui matrícula

  return (
      <Container>
        <h2>Detalhes do Aluno</h2>
        <p>Nome: {student.name}</p>
        <p>Parent: <Link to={`/parents/${student.responsible._id}`}>{student.responsible.name}</Link></p>
        {error && <ErrorMessage message={error} />}
        {isEnrolled ? (
            <>
              <h4>Matrícula Atual</h4>
              {enrollment.map((enroll) => (
                  <>
                    <p>{enroll.student?.name}</p>
                    <p>Turma Atual ID: {enroll.classId._id}</p>
                    <p>Data da Matrícula: {new Date(enroll.createdAt).toLocaleDateString()}</p>
                  </>
              ))}

              <Form>
                <Form.Group controlId="formClassUpdate">
                  <Form.Label>Alterar para outra turma</Form.Label>
                  <Form.Control
                      as="select"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map((classItem) => (
                        <option key={classItem._id} value={classItem._id} >
                          {classItem.name}
                        </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Button onClick={handleEnroll} className="mt-3" variant="warning">
                  Alterar Turma
                </Button>
              </Form>
            </>
        ) : (
            <Form>
              <Form.Group controlId="formClassSelect">
                <Form.Label>Selecione uma turma</Form.Label>
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
        )}
      </Container>
  );
};

export default StudentDetails;