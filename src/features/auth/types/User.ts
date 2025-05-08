import { IRole } from './Role.ts';

// Interface definition
export interface IUser {
    id?: string;
    username: string;
    email: string;
    enabled: boolean;
    passwordResetToken?: string;      // Optional in interface
    passwordResetExpires?: Date;      // Optional in interface
    roles: Set<IRole>;
    createdAt: Date;
    updatedAt: Date;
    comparePassword?(password: string): Promise<boolean>;
}
