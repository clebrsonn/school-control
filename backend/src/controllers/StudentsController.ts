// filepath: /e:/IdeaProjects/school-control/backend/src/controllers/StudentsController.ts
import { Request, Response } from 'express';
import { createStudent, getStudents, getStudentsByParentId, getStudentById, updateStudentById, deleteStudentById } from '../services/StudentService';

export const addStudent = async (req: Request, res: Response) => {
  try {
    const student = await createStudent(req.body);
    res.status(201).send(student);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchStudents = async (req: Request, res: Response) => {
  try {
    const students = await getStudents();
    res.status(200).send(students);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchStudentsByParentId = async (req: Request, res: Response) => {
  try {
    const students = await getStudentsByParentId(req.params.parentId);
    res.status(200).send(students);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchStudentById = async (req: Request, res: Response) => {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) {
      res.status(404).send({ message: 'Student not found' });
      return ;
    }
    res.status(200).send(student);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await updateStudentById(req.params.id, req.body);
    if (!student) {
      res.status(404).send({ message: 'Student not found' });
      return;
    }
    res.status(200).send(student);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await deleteStudentById(req.params.id);
    if (!student) {
      res.status(404).send({ message: 'Student not found' });
      return;
    }
    res.status(200).send({ message: 'Student deleted successfully' });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};