// filepath: /e:/IdeaProjects/school-control/frontend/src/components/ClassDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchClassById } from '../../services/ClassService';
import { IClass } from '@hyteck/shared';

const ClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [classItem, setClassItem] = useState<IClass>();

  useEffect(() => {
    const getClass = async () => {
      const classData = await fetchClassById(id);
      setClassItem(classData);
    };
    getClass();
  }, [id]);

  if (!classItem) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Class Details</h2>
      <p>Class Name: {classItem.name}</p>
      <p>Matrícula: {classItem.enrollmentFee}</p>
      <p>Mensalidade: {classItem.monthlyFee}</p>
      <p>Start Time: {classItem.startTime}</p>
      <p>End Time: {classItem.endTime}</p>
      {/* Adicione mais detalhes conforme necessário */}
    </div>
  );
};

export default ClassDetails;