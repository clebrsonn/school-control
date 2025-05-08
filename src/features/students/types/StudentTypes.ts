export interface StudentRequest {
  name: string;
  email: string;
  cpf?: string;
  responsibleId: string;
}

export interface StudentResponse extends StudentRequest{
  id: string;
  responsibleName: string;
  createdAt: string;
  updatedAt: string;
}