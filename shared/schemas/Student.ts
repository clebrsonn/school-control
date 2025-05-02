// Interface definition
export interface IStudent {
    id?: string;
    name: string;
    email: string;
    cpf: string;
    birthDate?: Date;
    responsibleId: string;
    responsibleName: string;
    classId: string;
    createdAt: Date;
    updatedAt: Date;
}
