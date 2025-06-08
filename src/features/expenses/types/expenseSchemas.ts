import { z } from 'zod';

export const expenseSchema = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória." }),
  amount: z.preprocess(
    (val) => parseFloat(String(val).replace(',', '.')),
    z.number({ required_error: "Valor é obrigatório." })
      .positive({ message: "Valor da despesa deve ser positivo." })
  ),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return undefined;
  }, z.date({ required_error: "Data é obrigatória.", invalid_type_error: "Data inválida." })),
  category: z.string().min(1, {message: "Categoria é obrigatória."}).optional().or(z.literal('')), // Example, could be an enum
  // paid: z.boolean().optional().default(false), // Example
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Schema for API if date needs to be string YYYY-MM-DD
export const expenseApiSchema = expenseSchema.extend({
  date: expenseSchema.shape.date.transform(date => date.toISOString().split('T')[0])
});
export type ExpenseApiData = z.infer<typeof expenseApiSchema>;
