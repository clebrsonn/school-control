import {UserService} from "../services/UserService";
import {BaseController} from "./generics/BaseController";
import {IUser} from "@hyteck/shared";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {TokenService} from "../services/TokenService";

const userService = new UserService();
const tokenService = new TokenService();

export class UserController extends BaseController<IUser> {
    constructor() {
        super(userService)
    }

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).userId;
            await tokenService.deleteByUserId(userId);
            res.status(200).send({message: 'Logged out successfully'});
        } catch (error) {
            next(error);
        }
    }

    userInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        try {
            const decoded: any = jwt.verify((token as string), process.env.JWT_SECRET!);
            const user = await userService.findById(decoded.userId);
            if (!user) {
                res.status(404).json({message: 'User not found'});
                return;
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    }
}