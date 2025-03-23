import { authMiddleware, errorHandler } from '../middleware';
import { Express } from 'express';
import {
    AuthRoutes,
    classRoutes,
    discountRoutes,
    enrollmentRoutes,
    expenseRoutes,
    parentRoutes,
    paymentRoutes,
    studentRoutes,
    userRoutes
} from '../routes';

const publicRoutes = (app: Express) => {

    app.use('/auth', AuthRoutes);
};

const protectedRoutes = (app: Express) => {
    app.use(authMiddleware);

    app.use('/users', userRoutes);
    app.use('/parents', parentRoutes);
    app.use('/students', studentRoutes);
    app.use('/payments', paymentRoutes);
    app.use('/discounts', discountRoutes);
    app.use('/classes', classRoutes);
    app.use('/enrollments', enrollmentRoutes);
    app.use('/expenses', expenseRoutes);

    app.use(errorHandler);
};


export const routes = (app: Express) => {
    publicRoutes(app);
    protectedRoutes(app);
}