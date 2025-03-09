import express from "express";
import {UserController} from "../controllers/UsersController";

const userController = new UserController();
const userRoute = express.Router();


userRoute.get('/logout', userController.logout);
userRoute.get('/me', userController.userInfo);


export default userRoute;