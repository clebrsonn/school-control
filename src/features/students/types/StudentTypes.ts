export interface StudentRequest {
  name: string;
  email: string;
  responsibleId: string;
  classroom: string;
}

export interface StudentResponse extends StudentRequest{
  id: string;
  responsibleName: string;
  createdAt: string;
  updatedAt: string;
}