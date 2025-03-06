import {UserService} from "../services/UserService";
import {BaseController} from "./generics/BaseController";
import {IUser} from "@hyteck/shared";

const userService= new UserService();

export class UserController extends BaseController<IUser>{
    constructor() {
        super(userService)
    }
}