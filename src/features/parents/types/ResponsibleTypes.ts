import { StudentResponse } from '../../students/types/StudentTypes.ts';

export interface ResponsibleRequest {
  name: string;
  email: string;
  phone: string;
  document?: string;
  students ?: Partial<StudentResponse>[];
}

export interface ResponsibleResponse extends ResponsibleRequest{
  id: string;
}