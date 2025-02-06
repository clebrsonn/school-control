import React, { useState, useEffect } from 'react';
import { fetchClasses, createClass, deleteClass } from '@services/ClassService';
import { Button, Form, Container, Table } from 'react-bootstrap';
import { IClass } from '@hyteck/shared';
import notification from "../Notification";
import ListRegistries from "../pieces/ListRegistries.tsx";

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [enrollmentFee, setEnrollmentFee] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getClasses = async () => {
      try {
        const classData = await fetchClasses();
        setClasses(classData);
      } catch (err) {
        setError(err.message || 'Failed to fetch classes');
      }
    };

    getClasses();
  }, []);

  const handleAddClass = async () => {
    try {
      const newClass = {
        name,
        startTime,
        endTime,
        enrollmentFee: parseFloat(enrollmentFee),
        monthlyFee: parseFloat(monthlyFee),
      };
      const addedClass = await createClass(newClass);
      setClasses([...classes, addedClass]);
      setName('');
      setStartTime('');
      setEndTime('');
      setEnrollmentFee('');
      setMonthlyFee('');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to add class');
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteClass(id);
      setClasses(classes.filter((clazz) => clazz._id !== id));
      notification("Turma removida com sucesso.");
    } catch {
      setError("Erro ao remover a turma.");
    }
  };

  return (
      <Container>
        <h1>Classes</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form>
          <Form.Group controlId="formClassName">
            <Form.Label>Nome</Form.Label>
            <Form.Control
                type="text"
                placeholder="Class Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formClassStartTime">
            <Form.Label>Horário de início</Form.Label>
            <Form.Control
                type="text"
                placeholder="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formClassEndTime">
            <Form.Label>horário de término</Form.Label>
            <Form.Control
                type="text"
                placeholder="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formClassEnrollmentFee">
            <Form.Label>Matrícula</Form.Label>
            <Form.Control
                type="text"
                placeholder="Enrollment Fee"
                value={enrollmentFee}
                onChange={(e) => setEnrollmentFee(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formClassMonthlyFee">
            <Form.Label>Mensalidade</Form.Label>
            <Form.Control
                type="text"
                placeholder="Monthly Fee"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
            />
          </Form.Group>
          <Button onClick={handleAddClass} className="mt-3">Add Class</Button>
        </Form>
        <h3 className="mt-4">Lista de Turmas</h3>
        <ListRegistries data={classes} entityName={'classe'}  onDelete={handleDelete}></ListRegistries>
      </Container>
  );
};

export default ClassManager;