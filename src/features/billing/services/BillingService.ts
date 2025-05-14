import { get, post } from '../../../config/axios';
import { ConsolidatedStatement } from '../types/BillingTypes';

/**
 * Get consolidated statement
 * @param responsibleId Responsible ID
 * @param yearMonth Year and month (YYYY-MM)
 * @returns Consolidated statement
 */
export const getConsolidatedStatement = async (responsibleId: string, yearMonth: string): Promise<ConsolidatedStatement> => {
  const response = await get<ConsolidatedStatement>(`/billing/responsibles/${responsibleId}/statements/${yearMonth}`);
  return response;
};

/**
 * Get consolidated statement
 * @param yearMonth Year and month (YYYY-MM)
 * @returns Consolidated statement
 */
export const getConsolidatedStatements = async (yearMonth: string): Promise<ConsolidatedStatement[]> => {
  const response = await get<ConsolidatedStatement[]>(`/billing/statements/${yearMonth}`);
  return response;
};

/**
 * Generate monthly billing
 * @param yearMonth Year and month (YYYY-MM)
 * @returns Consolidated statement
 */
export const generateMonthlyBiling = async ( yearMonth: string): Promise<void> => {
  await post<void, void>(`/billing/generate-monthly-invoices/${yearMonth}`, undefined);
};

/**
 * Generate monthly billing
 * @returns The number od Invoices by status
 * @param status
 */
export const countInvoicesByStatus = async ( status: string): Promise<number> => {
  return await get<number>(`/billing/invoices/${status}/count`);
};

