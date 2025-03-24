import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ParentManager from '../components/managers/ParentManager';
import StudentManager from '../components/managers/StudentManager';
import PaymentManager from '../components/managers/PaymentManager';
import ClassManager from '../components/managers/ClassManager';
import ParentDetails from '../components/details/ParentDetails';
import StudentDetails from '../components/details/StudentDetails';
import PaymentDetails from '../components/details/PaymentDetails';
import ClassDetails from '../components/details/ClassDetails';
import DiscountManager from '../components/managers/DiscountManager';
import HomeReport from '../components/HomeReport';
import LoginPage from '../features/auth/components/LoginPage.tsx';
import RegisterPage from '../features/auth/components/RegisterPage.tsx';
import ProtectedRoute from './ProtectedRoutes';
import { ExpenseList } from '../features/expenses/components/ExpenseList.tsx';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/parents" element={<ParentManager />} />
                <Route path="/students" element={<StudentManager responsible={undefined} />} />
                <Route path="/payments" element={<PaymentManager />} />
                <Route path="/classes" element={<ClassManager />} />
                <Route path="/discounts/" element={<DiscountManager />} />
                <Route path="/expenses" element={<ExpenseList />} />
                <Route path="/parents/:id" element={<ParentDetails />} />
                <Route path="/students/:id" element={<StudentDetails />} />
                <Route path="/payments/:id" element={<PaymentDetails />} />
                <Route path="/classes/:id" element={<ClassDetails />} />
                <Route path="/" element={<HomeReport />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
