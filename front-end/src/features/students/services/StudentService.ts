import { axiosDelete, axiosPut, get, post } from '../../../config/axios';
import { PageResponse } from '../../../types/PageResponse';
import { StudentRequest, StudentResponse } from '../types/StudentTypes';


const API_URL = '/students';
/**
 * Get all students
 * @param pageable Pagination parameters
 * @returns Page of student responses
 */
export const getAllStudents = async (pageable: { page: number, size: number, sort?: string[] }) => {
  const response = await get<PageResponse<StudentResponse>>(API_URL, { params: pageable });
  return response;
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
