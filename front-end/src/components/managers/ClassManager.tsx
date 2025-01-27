// filepath: /e:/IdeaProjects/school-control/frontend/src/components/ClassManager.tsx
import React, { useState, useEffect } from 'react';
import { fetchClasses, addClass } from '@services/ClassService';
import ErrorMessage from '../ErrorMessage';
import { Button, Form, InputGroup, Row } from 'react-bootstrap';

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getClasses = async () => {
      try {
        const classes = await fetchClasses();
        setClasses(classes);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch classes');
      }
    };
    getClasses();
  }, []);

  const handleAddClass = async () => {
    try {
      const newClass = {
        className,
        dayOfWeek,
        startTime,
        endTime,
        studentId,
      };
      const addedClass = await addClass(newClass);
      setClasses([...classes, addedClass]);
      setClassName('');
      setDayOfWeek('');
      setStartTime('');
      setEndTime('');
      setStudentId('');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add class');
    }
  };

  return (
    <div>
      <h1>Class Manager</h1>
      <ErrorMessage message={error} />
      
      <Form.Control
        type="text"
        placeholder="Class Name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
      />
      <Form.Control
        type="text"
        placeholder="Day of Week"
        value={dayOfWeek}
        onChange={(e) => setDayOfWeek(e.target.value)}
      />
      <Form.Control
        type="text"
        placeholder="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <Form.Control
        type="text"
        placeholder="End Time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <Form.Control
        type="text"
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
        <Button onClick={handleAddClass}>Add Class</Button>
      
      
      <ul>
        {classes.map((classItem: any) => (
          <li key={classItem._id}>
            {classItem.className} - {classItem.dayOfWeek} - {classItem.startTime} - {classItem.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassManager;