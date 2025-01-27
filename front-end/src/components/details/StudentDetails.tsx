// filepath: /e:/IdeaProjects/school-control/frontend/src/components/StudentDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStudentById } from '../../services/StudentService';

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const getStudent = async () => {
      const studentData = await fetchStudentById(id);
      setStudent(studentData);
    };
    getStudent();
  }, [id]);

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Student Details</h2>
      <p>Name: {student.nome}</p>
      <p>Parent ID: {student.parentId}</p>
      {/* Adicione mais detalhes conforme necessário */}
    </div>
  );
};

export default StudentDetails;