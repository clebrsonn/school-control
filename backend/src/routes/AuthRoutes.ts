import express from 'express';
import {AuthController} from "../controllers/AuthController";

const AuthRoutesRouter = express.Router();
const authController = new AuthController();
AuthRoutesRouter.post('/register', authController.register);
AuthRoutesRouter.post('/login', authController.login);

export const AuthRoutes= AuthRoutesRouter;