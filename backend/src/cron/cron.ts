import cron from 'node-cron';
import {PaymentService} from '../services/PaymentService';
import {logger} from "../utils/Logger";

const tuitionService = new PaymentService();

// Agendamento: Executa todo dia 1º do mês às 00:00 [[8]]
cron.schedule('0 0 1 * *', async () => {
        await tuitionService.generateMonthlyTuitions();
        logger.info('Mensalidades geradas com sucesso!');
}, {
    timezone: 'America/Sao_Paulo' // [[2]][[8]]
});
