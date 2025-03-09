import {BaseService} from "./generics/BaseService";
import {IRole, Role} from "@hyteck/shared";

export class RoleService extends BaseService<IRole>{
    constructor() {
        super(Role);
    }
    async getByName(name: string): Promise<IRole | null> {
        return Role.findOne({ name }).exec();
    }
}