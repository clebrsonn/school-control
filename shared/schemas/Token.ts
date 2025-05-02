import { IUser } from './User';

// Interface definition
export interface IToken {
    id?: string;
    userId: string | IUser;
    token: string;
    expiresAt: Date;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}
