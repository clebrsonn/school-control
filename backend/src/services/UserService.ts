import {BaseService} from "./generics/BaseService";
import {IUser, User} from "@hyteck/shared";

export class UserService extends BaseService<IUser>{
    constructor() {
        super(User);
        this.populateFields=['role'];
    }

    async getByUsername(username: string): Promise<IUser | null> {
        return User.findOne({ username, isActive: true  }).populate('role').exec();
    }
    async getByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email, isActive: true }).populate('role').exec();
    }
}