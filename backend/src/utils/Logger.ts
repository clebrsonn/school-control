import {createLogger, format, transports} from 'winston';

export const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
            if(typeof message === 'string') {
                return `[${timestamp}] ${level}: ${message}\n`;
            }
            return `[${timestamp}] ${level}: ${JSON.stringify(message)}\n`;
        })
    ),
    transports: [
        new transports.Console(),
        //new transports.File({ filename: 'logs/app.log' }) // Salva logs em arquivo
    ]
});