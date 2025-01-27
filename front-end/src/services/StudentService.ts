// filepath: /e:/IdeaProjects/school-control/frontend/src/services/StudentService.ts
import { get } from '../config/axios/get';
import { post } from '../config/axios/post';

export const fetchStudents = async () => {
  const response = await get('/students');
  return response;
};

export const addStudent = async (studentData: any) => {
  const response = await post('/students', studentData);
  return response;
};

export const fetchStudentById = async (id: string) => {
  const response = await get(`/students/${id}`);
  return response;
};

export const fetchStudentsByParentId = async (parentId: string) => {
    const response = await get(`/students/parent/${parentId}`);
    return response;
  };