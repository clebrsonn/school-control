import {NextFunction, Request, Response} from 'express';
import {Config} from "../utils/Config";

// Custom error type to handle status codes in errors
interface ErrorWithStatus extends Error {
    status?: number;
}
// Constants for default values
const DEFAULT_STATUS = 500;
const DEFAULT_MESSAGE = 'Internal server error';

// Generic error-handling middleware
export function errorHandler(
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('[Error Handler]', err); // Log do erro no console
    // Determine status and message
    const status = err.status || DEFAULT_STATUS;
    const message = err.message || DEFAULT_MESSAGE;

    // Determine whether to include the stack trace (only in development)
    const stack = Config.NODE_ENV === 'production' ? undefined : err.stack;

    // Log errors to console (avoid verbose logging in production)
    if (Config.NODE_ENV !== 'production') {
        console.error('[Error Handler]', err);
    }

    // Send standardized error response
    res.status(status).json({
        message,
        stack,
    });
    return next();
}