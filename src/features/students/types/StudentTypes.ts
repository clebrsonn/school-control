export interface StudentRequest {
  name: string;
  email: string;
  responsibleId: string;
  classroom: string;
  enrollmentFee: number;
  monthyFee: number;
}

export interface StudentResponse extends StudentRequest {
  id: string;
  responsibleName: string;
  createdAt: string;
  updatedAt: string;
}
