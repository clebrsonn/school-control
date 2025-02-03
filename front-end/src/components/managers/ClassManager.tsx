import React, { useState, useEffect } from 'react';
import { fetchClasses, addClass } from '@services/ClassService';
import { Button, Form, Container, ListGroup } from 'react-bootstrap';
import { IClass } from '@hyteck/shared';

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [weekdays, setWeekdays] = useState<string[]>([]);
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
        weekdays,
        enrollmentFee: parseFloat(enrollmentFee),
        monthlyFee: parseFloat(monthlyFee),
      };
      const addedClass = await addClass(newClass);
      setClasses([...classes, addedClass]);
      setName('');
      setStartTime('');
      setEndTime('');
      setWeekdays([]);
      setEnrollmentFee('');
      setMonthlyFee('');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to add class');
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
        <Form.Group controlId="formClassWeekdays">
          <Form.Label>Weekdays</Form.Label>
          <Form.Control
            type="text"
            placeholder="Weekdays (comma separated)"
            value={weekdays.join(', ')}
            onChange={(e) => setWeekdays(e.target.value.split(',').map(day => day.trim()))}
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
      <ListGroup className="mt-3">
        {classes?.map((classItem) => (
          <ListGroup.Item key={classItem._id}>
            {classItem.name}  - {classItem.startTime} - {classItem.endTime} - Enrollment Fee: {classItem.enrollmentFee} - Monthly Fee: {classItem.monthlyFee}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default ClassManager;