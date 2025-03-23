import express from 'express';
import cors from 'cors';
import './cron/cron';
import {configureLogs, Database, routes} from "./config";
import {logger} from "./utils/Logger";


const app = express();


app.use(cors({
    origin: '*', // Permitir todas as origens. Para maior segurança, especifique os domínios permitidos.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

Database.getInstance();

configureLogs(app);

routes(app);

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    //gracefulShutdown(); // Inicia shutdown controlado

    logger.error('cbc ' +error)
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    gracefulShutdown();
});



async function gracefulShutdown() {
    try {

        // 2. Fecha conexões com banco de dados
        await Database.getInstance().closeConnection(); // [[6]]

        console.log('Shutdown concluído. Saindo...');
        process.abort();
    } catch (error) {
        console.error('Erro durante shutdown:', error);
        process.exit(1); // Força saída após timeout [[3]]
    }
}

export default app;