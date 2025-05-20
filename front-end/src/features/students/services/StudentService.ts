import { IStudent } from '@hyteck/shared';
import { get } from '../../../config/axios/get.ts';
import { post } from '../../../config/axios/post.ts';
import { axiosDelete } from '../../../config/axios/delete.ts';
import { axiosPut } from '../../../config/axios/put.ts'; // Ensure axiosPut is imported

export const fetchStudents = async () => {
  const response = await get('/students');
  return response;
};

export const createStudent = async (studentData: IStudent) => {
  const response = await post('/students', studentData);
  return response;
};

export const fetchStudentById = async (id: string) => {
  const response = await get<IStudent>(`/students/${id}`);
  return response;
};

export const fetchStudentsByParentId = async (parentId: string) => {
    const response = await get<IStudent[]>(`/students/parent/${parentId}`);
    return response;
  };

  export const enrollStudent = async (studentId: string, classId: string) => {
    const response = await post(`/students/${studentId}/enroll`, { classId });
    return response;
  }

export const deleteStudent= async (id: string) => {
  const response = await axiosDelete(`/students/${id}`);
  return response;
}

export const cancelEnrollment = async (enrollmentId: string) => {
  const response = await get(`/enrollments/${enrollmentId}/cancel`);
  return response;
}

export const renewEnrollment = async (enrollmentId: string) => {
  const response = await get<{ enrollmentId: string }>(`/enrollments/${enrollmentId}/renew`);
  return response;
};

export const updateStudent = async (id: string, studentData: Partial<IStudent>): Promise<IStudent> => {
    const response = await axiosPut<Partial<IStudent>, IStudent>(`/students/${id}`, studentData);
    return response;
};