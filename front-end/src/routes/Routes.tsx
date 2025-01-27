import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ParentManager from '../components/managers/ParentManager';
import StudentManager from '../components/managers/StudentManager';
import PaymentManager from '../components/managers/PaymentManager';
import ClassManager from '../components/managers/ClassManager';
import ParentDetails from '../components/details/ParentDetails';
import StudentDetails from '../components/details/StudentDetails';
import PaymentDetails from '../components/details/PaymentDetails';
import ClassDetails from '../components/details/ClassDetails';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/parents" element={<ParentManager />} />
      <Route path="/students" element={<StudentManager />} />
      <Route path="/payments" element={<PaymentManager />} />
      <Route path="/classes" element={<ClassManager />} />
      <Route path="/parents/:id" element={<ParentDetails />} />
      <Route path="/students/:id" element={<StudentDetails />} />
      <Route path="/payments/:id" element={<PaymentDetails />} />
      <Route path="/classes/:id" element={<ClassDetails />} />
      <Route path="/" element={<h2>Welcome to the School Control Dashboard</h2>} />
    </Routes>
  );
};

export default AppRoutes;