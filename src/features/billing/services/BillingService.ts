import { get } from '../../../config/axios';
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