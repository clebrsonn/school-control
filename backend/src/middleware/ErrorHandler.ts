import {NextFunction, Request, Response} from 'express';
import {Config} from "../utils/Config";
import {logger} from "../utils/Logger";

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

    // Determine status and message
    const status = err.status || DEFAULT_STATUS;
    const message = err.message || DEFAULT_MESSAGE;

    // Determine whether to include the stack trace (only in development)
    const stack = Config.NODE_ENV === 'production' ? undefined : err.stack;

    logger.error({
        message: message,
        error: err,
        stack: stack,
        method: req.method,
        url: req.url,
    });

    // Send standardized error response
    res.status(status).json({
        message,
        stack,
    });
    return next();
}