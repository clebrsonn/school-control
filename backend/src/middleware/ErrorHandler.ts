import { Request, Response, NextFunction } from 'express';

// Middleware genérico de erros
export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('[Error Handler]', err); // Log do erro no console

    // Verifica o tipo do erro ou use status genérico
    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    // Retorna a resposta de erro em formato padrão
    res.status(status).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack, // Ocultar stack em produção
    });
}