export interface EnrollmentRequest {
  studentId: string;
  classRoomId: string;
  enrollmentFee?: number;
  monthyFee?: number;
}

export interface EnrollmentResponse {
  id: string;
  studentId: string;
  studentName: string;
  classRoomId: string;
  classRoomName: string;
  classRoomYear: string;
  enrollmentDate: Date;
  endDate: Date;
  status: string;
}
