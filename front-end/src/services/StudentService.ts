// filepath: /e:/IdeaProjects/school-control/frontend/src/services/StudentService.ts
import { IStudent } from '@hyteck/shared';
import { get } from '../config/axios/get';
import { post } from '../config/axios/post';
import {axiosDelete} from "../config/axios/delete.ts";

export const fetchStudents = async () => {
  const response = await get('/students');
  return response;
};

export const createStudent = async (studentData: IStudent) => {
  const response = await post('/students', studentData);
  return response;
};

export const fetchStudentById = async (id: string) => {
  const response = await get(`/students/${id}`);
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