import {IEnrollment, ITuition} from "@hyteck/shared";
import { get } from "../config/axios/get";

export const fetchMonthlyFeesByParentId = async (parentId: string) :Promise<ITuition[]> => {
  const response = await get<ITuition[]>(`/payments/parent/${parentId}`);
  return response;
};

export const fetchEnrollmentByStudent = async (studentId: string): Promise<IEnrollment> => {
  const response = await get<IEnrollment>(`/enrollments/student/${studentId}`);
  return response; // Retorna a matrícula
};