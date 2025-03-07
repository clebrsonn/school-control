import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ParentRoutesRouter from './routes/ParentRoutes';
import StudentRoutesRouter from './routes/StudentRoutes';
import PaymentRoutesRouter from './routes/PaymentRoutes';
import DiscountRoutesRouter from './routes/DiscountRoutes';
import ClassRoutesRouter from './routes/ClassRoutes';
import EnrollmentRoutes from "./routes/EnrollmentRoutes";
import {errorHandler} from "./middleware/ErrorHandler";
import {authMiddleware} from "./middleware/AuthHandler";
import AuthRoutesRouter from "./routes/AuthRoutes";
import {Config} from "./utils/Config";
import userRoute from "./routes/UserRoutes";
import {logger} from "./utils/Logger";

const app = express();

var morgan = require('morgan')

app.use(cors({
    origin: '*', // Permitir todas as origens. Para maior segurança, especifique os domínios permitidos.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('combined'));

mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.info({
        collectionName,
        method,
        query,
        doc: doc || undefined,
    });
});

mongoose.connect(Config.DB_URI).then(() => {
    logger.debug('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.use((req, res, next) => {
    logger.debug({
        method: req.method,
        url: req.url,
        payload: req.body,
        headers: req.headers,
    });
    next();
});

app.use('/auth', AuthRoutesRouter); // Add AuthRoutes

app.use(authMiddleware);

app.use('/users', userRoute);
app.use('/parents', ParentRoutesRouter);
app.use('/students', StudentRoutesRouter);
app.use('/payments', PaymentRoutesRouter);
app.use('/discounts', DiscountRoutesRouter);
app.use('/classes', ClassRoutesRouter);
app.use("/enrollments", EnrollmentRoutes);

app.use(errorHandler);


export default app;