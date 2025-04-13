tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentManager from './components/managers/StudentManager';
import ParentManager from './components/managers/ParentManager';
import ClassManager from './components/managers/ClassManager';
import PaymentManager from './components/managers/PaymentManager';
import EnrollmentManager from './components/managers/EnrollmentManager';
import ExpenseManager from './components/managers/ExpenseManager';
import Home from './components/Home';

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/students" element={<StudentManager />} />
                <Route path="/parents" element={<ParentManager />} />
                <Route path="/classes" element={<ClassManager />} />
                <Route path="/payments" element={<PaymentManager />} />
                <Route path="/enrollments" element={<EnrollmentManager />} />
                <Route path="/expenses" element={<ExpenseManager />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;