export interface EnrollmentRequest {
  studentId: string;
  classRoomId?: string;
  classroomName?: string;
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
  monthlyFee?: number;
  enrollmentDate?: string; // date-time
  endDate?: string; // date-time
  status: string;
}
