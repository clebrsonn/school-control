import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ParentRoutesRouter from './routes/ParentRoutes';
import StudentRoutesRouter from './routes/StudentRoutes';
import PaymentRoutesRouter from './routes/PaymentRoutes';
import DiscountRoutesRouter from './routes/DiscountRoutes';
import ClassRoutesRouter from './routes/ClassRoutes';
import EnrollmentRoutes from "./routes/EnrollmentRoutes";
const app = express();

app.use(cors({
  origin: '*', // Permitir todas as origens. Para maior segurança, especifique os domínios permitidos.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/financial_manager').then(() => {
    console.log('Connected to MongoDB');
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use('/parents', ParentRoutesRouter);
app.use('/students', StudentRoutesRouter);
app.use('/payments', PaymentRoutesRouter);
app.use('/discounts', DiscountRoutesRouter);
app.use('/classes', ClassRoutesRouter);
app.use("/enrollments", EnrollmentRoutes);

export default app;