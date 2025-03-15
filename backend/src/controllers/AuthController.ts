import {NextFunction, Request, Response} from "express";
import {UserService} from "../services/UserService";
import {TokenService} from "../services/TokenService";
import {RoleService} from "../services/RoleService";
import jwt from "jsonwebtoken";
import {IRole, IToken, IUser} from "@hyteck/shared";
import {Types} from "mongoose";
import {Config} from "../utils/Config";
import {logger} from "../utils/Logger";

const userService: UserService = new UserService();
const tokenService: TokenService = new TokenService();
const roleService: RoleService = new RoleService();

export class AuthController {
    private readonly secret: string = Config.JWT_SECRET;

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {username, email, password, roleName} = req.body;
            if (!username || !email || !password || !roleName) {
                logger.debug(`${username}, ${email}, ${password}, ${roleName}`);
                res.status(400).send({message: 'Please provide all fields'});
                return;
            }
            let role: IRole | null = await roleService.getByName(roleName);
            if (!role) {
                res.status(400).send({message: 'Invalid role provided'});
                return;
            }

            const user: Partial<IUser> = {
                username,
                email,
                passwordHash: password, // The password will be hashed by the model
                role: role._id as Types.ObjectId
            };
            const newUser = await userService.create(user);
            res.status(201).send({error: 'User created successfully', user: newUser});
            return;
        } catch (error) {
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userAgent = req.get('User-Agent');
            const {username, password} = req.body;
            if (!username || !password || !userAgent) {
                res.status(400).send({error: 'Please provide all fields'});
                return;
            }
            const user = await userService.getByUsername(username);
            if (!user) {
                res.status(401).send({error: 'Invalid username or password'});
                return;
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                res.status(401).send({error: 'Invalid username or password'});
                return;
            }

            const token = jwt.sign({userId: user._id}, this.secret, {expiresIn: parseInt(Config.TOKEN_EXPIRATION)});
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

            const tokenData: Partial<IToken> = {
                userId: user._id as Types.ObjectId,
                token,
                expiresAt,
                userAgent
            };

            await tokenService.deleteByUserId((tokenData.userId as Types.ObjectId).toString());
            await tokenService.create(tokenData);

            res.status(200).send({token, user});
        } catch (error) {
            next(error);
        }
    }
}