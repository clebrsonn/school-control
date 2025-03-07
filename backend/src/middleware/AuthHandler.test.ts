import {NextFunction, Request, Response} from 'express';
import {authMiddleware} from './AuthHandler';
import {TokenService} from '../services/TokenService';
import jwt from 'jsonwebtoken';
import {beforeEach, describe, it, mock} from 'node:test';
import assert from 'assert';

mock('../services/TokenService');
mock('jsonwebtoken');

describe('authMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: function (statusCode: number) {
                this.statusCode = statusCode;
                return this;
            },
            send: function (message: any) {
                this.message = message;
            }
        } as Partial<Response>;
        next = function () {};
    });

    it('should call next if token is valid', async () => {
        req.headers!.authorization = 'Bearer validToken';
        (TokenService.prototype.findByToken as any).mockResolvedValue(true);
        (jwt.verify as any).mockImplementation((token: string, secret: string, callback: (err: Error | null, decoded: any) => void) => {
            callback(null, { userId: '123' });
        });

        await authMiddleware(req as Request, res as Response, next);

        assert.strictEqual((req as any).userId, '123');
    });

    it('should return 401 if no token is provided', async () => {
        await authMiddleware(req as Request, res as Response, next);

        assert.strictEqual(res.statusCode, 401);
        assert.deepStrictEqual(res.message, { message: 'No token provided' });
    });

    it('should return 401 if token is invalid', async () => {
        req.headers!.authorization = 'Bearer invalidToken';
        (TokenService.prototype.findByToken as any).mockResolvedValue(false);

        await authMiddleware(req as Request, res as Response, next);

        assert.strictEqual(res.statusCode, 401);
        assert.deepStrictEqual(res.message, { message: 'Invalid token' });
    });

    it('should return 401 if token verification fails', async () => {
        req.headers!.authorization = 'Bearer validToken';
        (TokenService.prototype.findByToken as any).mockResolvedValue(true);
        (jwt.verify as any).mockImplementation((token: string, secret: string, callback: (err: Error | null, decoded: any) => void) => {
            callback(new Error('Token verification failed'), null);
        });

        await authMiddleware(req as Request, res as Response, next);

        assert.strictEqual(res.statusCode, 401);
        assert.deepStrictEqual(res.message, { message: 'Failed to authenticate token' });
    });

    it('should return 500 if an error occurs', async () => {
        req.headers!.authorization = 'Bearer validToken';
        (TokenService.prototype.findByToken as any).mockRejectedValue(new Error('Database error'));

        await authMiddleware(req as Request, res as Response, next);

        assert.strictEqual(res.statusCode, 500);
        assert.deepStrictEqual(res.message, { message: 'Failed to authenticate token' });
    });
});