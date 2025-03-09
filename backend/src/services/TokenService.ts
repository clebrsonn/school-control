import {BaseService} from "./generics/BaseService";
import {IToken, Token} from "@hyteck/shared";

export class TokenService extends BaseService<IToken>{
    constructor() {
        super(Token);
    }

    async findByToken(token: string): Promise<IToken | null> {
        return Token.findOne({ token }).exec();
    }


    async deleteByUserId(userId: string): Promise<void> {
        await Token.deleteMany({ userId });
    }
}