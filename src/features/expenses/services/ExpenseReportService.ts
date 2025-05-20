import { get } from '../../../config/axios';
import { ExpenseReport } from '../types/ExpenseReportTypes';

/**
 * Get expense report
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Expense report
 */
export const getExpenseReport = async (startDate: string, endDate: string): Promise<ExpenseReport> => {
  const response = await get<ExpenseReport>(`/expense-reports?startDate=${startDate}&endDate=${endDate}`);
  return response;
};