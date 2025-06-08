import { z } from 'zod';

export const paymentMethods = ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "DINHEIRO", "BOLETO"] as const;
const PaymentMethodEnum = z.enum(paymentMethods, {
    errorMap: () => ({ message: "Método de pagamento inválido." })
});

export const paymentSchema = z.object({
  studentId: z.string().min(1, { message: "Estudante é obrigatório." }),
  amount: z.preprocess(
    (val) => parseFloat(String(val).replace(',', '.')), // Handle comma as decimal separator
    z.number().positive({ message: "Valor deve ser positivo." })
  ),
  paymentDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    // return undefined; // Let Zod handle if it's not a date or string
  }, z.date({ required_error: "Data de pagamento é obrigatória." })),
  paymentMethod: PaymentMethodEnum,
  description: z.string().optional().or(z.literal('')),
  // referenceMonth and referenceYear might be needed depending on backend PaymentRequest
  referenceMonth: z.string().optional().or(z.literal('')), // Example: "01", "02", ..., "12"
  referenceYear: z.string().optional().or(z.literal('')),  // Example: "2023"
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Schema for API if date needs to be string
export const paymentApiSchema = paymentSchema.extend({
  paymentDate: paymentSchema.shape.paymentDate.transform(date => date.toISOString().split('T')[0]) // Format to YYYY-MM-DD
});
export type PaymentApiData = z.infer<typeof paymentApiSchema>;
