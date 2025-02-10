import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParentRoutesRouter from './routes/ParentRoutes';
import StudentRoutesRouter from './routes/StudentRoutes';
import PaymentRoutesRouter from './routes/PaymentRoutes';
import DiscountRoutesRouter from './routes/DiscountRoutes';
import ClassRoutesRouter from './routes/ClassRoutes';
import EnrollmentRoutes from "./routes/EnrollmentRoutes";
import {errorHandler} from "./middleware/ErrorHandler";
const app = express();

dotenv.config();

app.use(cors({
  origin: '*', // Permitir todas as origens. Para maior segurança, especifique os domínios permitidos.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose.set('debug', (collectionName, method, query, doc) => {
  console.debug('[Mongoose Query]', {
    collectionName,
    method,
    query,
    doc: doc || undefined,
  });
});

mongoose.connect(process.env.MONGO_URL || '').then(() => {
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

app.use(errorHandler);

export default app;