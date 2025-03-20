import express from "express";
import {UserController} from "../controllers/UsersController";

const userController = new UserController();
const router = express.Router();


router.get('/logout', userController.logout);
router.get('/me', userController.userInfo);


export const userRoutes=router;