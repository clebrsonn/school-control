// Interface definition
export interface IRole {
    id?: string;
    name: string;
    description: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}
