// E:/IdeaProjects/school-control/backend/src/middleware/AuthHandler.ts
import {NextFunction, Request, Response} from "express";
import jwt, {JwtPayload} from 'jsonwebtoken';
import {TokenService} from "../services/TokenService";
import {Config} from "../utils/Config";

const tokenService = new TokenService();
const secret = Config.JWT_SECRET;

interface CustomJwtPayload extends JwtPayload {
    userId: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).send({message: 'No token provided'});
            return;
        }
        const token = authHeader.split(' ')[1];
        //call the findByToken method
        const tokenDb = await tokenService.findByToken(token);
        if (!tokenDb) {
            res.status(401).send({message: 'Invalid token'});
            return;
        }
        console.log(secret)
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                res.status(401).send({message: 'Failed to authenticate token'});
                return;
            }
            //use the interface you defined
            (req as any).userId = (decoded as CustomJwtPayload).userId;
            next();
        });
    } catch (err) {
        res.status(500).send({message: 'Failed to authenticate token'});
    }
};