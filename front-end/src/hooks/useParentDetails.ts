import {useEffect, useState} from 'react';
import {IResponsible, IStudent, ITuition} from "@hyteck/shared";
import {fetchParentById} from "../services/ParentService.ts";
import {fetchStudentsByParentId} from "../services/StudentService.ts";
import {groupPaymentsByParentId} from "../services/PaymentService.ts";

export const useParentDetails = (id: string) => {
  const [parent, setParent] = useState<IResponsible>();
  const [students, setStudents] = useState<IStudent[]>([]);
  const [monthlyFees, setMonthlyFees] = useState<ITuition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentData, studentData, monthlyFeeData] = await Promise.all([
          fetchParentById(id),
          fetchStudentsByParentId(id),
          groupPaymentsByParentId(id)
        ]);

        setParent(parentData);
        setStudents(studentData);
        setMonthlyFees(monthlyFeeData);
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch data');
      }
    };

    fetchData();
  }, [id]);

  return { parent, students, monthlyFees, error };
};
