import { axiosDelete, axiosPut, get, post } from '../../../config/axios';
import { PageResponse } from '../../../types/PageResponse';
import { StudentRequest, StudentResponse } from '../types/StudentTypes';


const API_URL = '/students';
/**
 * Get all students
 * @param pageable Pagination parameters
 * @returns Page of student responses
 */
export const getAllStudents = async (pageable: { page: number, size: number, sort?: string }): Promise<PageResponse<StudentResponse>> => {
  return await get<PageResponse<StudentResponse>>(API_URL, { params: pageable });
};

/**
 * Create student
 * @param studentData Student request data
 * @returns Student response
 */
export const createStudent = async (studentData: StudentRequest): Promise<StudentResponse> => {
  const response = await post<StudentRequest, StudentResponse>(API_URL, studentData);
  return response;
};

/**
 * Update student
 * @param id Student ID
 * @param studentData Student request data
 * @returns Student response
 */
export const updateStudent = async (id: string, studentData: Partial<StudentRequest>): Promise<StudentResponse> => {
  const response = await axiosPut<Partial<StudentRequest>, StudentResponse>(`${API_URL}/${id}`, studentData);
  return response;
};

/**
 * Get student by ID
 * @param id Student ID
 * @returns Student response
 */
export const getStudentById = async (id: string): Promise<StudentResponse> => {
  const response = await get<StudentResponse>(`${API_URL}/${id}`);
  return response;
};

/**
 * Delete student
 * @param id Student ID
 * @returns No content
 */
export const deleteStudent = async (id: string): Promise<void> => {
  await axiosDelete(`${API_URL}/${id}`);
};

/**
 * Get students by Classroom ID
 * @param classroomId Classroom ID
 * @param pageable Pagination parameters
 * @returns Page of student responses
 */
export const getStudentsByClassId = async (classroomId: string, pageable: { page: number, size: number, sort?: string }): Promise<PageResponse<StudentResponse>> => {
  return await get<PageResponse<StudentResponse>>(`${API_URL}/classroom/${classroomId}`, { params: pageable }); // Assuming endpoint like /students/classroom/{classroomId} or /students?classroomId=...
  // If the backend expects /students?classroomId=XYZ, the call would be:
  // return await get<PageResponse<StudentResponse>>(API_URL, { params: { ...pageable, classroomId } });
};
