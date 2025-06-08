import { z } from 'zod';

export const discountTypes = ["MATRICULA", "MENSALIDADE"] as const;
const DiscountTypeEnum = z.enum(discountTypes, {
    errorMap: () => ({ message: "Tipo de desconto inválido." })
});

export const discountSchema = z.object({
  name: z.string().min(1, { message: "Nome do desconto é obrigatório." }),
  // The 'value' field in the old code was generic. Assuming it's a numeric value.
  // If it's specifically a percentage, further constraints like max(100) might be needed.
  // If it can be a fixed amount OR percentage, the schema would need to be more complex (e.g. using discriminated union or refine).
  // For now, treating it as a general positive number.
  value: z.preprocess(
    (val) => String(val).trim() ? parseFloat(String(val).replace(',', '.')) : undefined,
    z.number({ required_error: "Valor é obrigatório.", invalid_type_error: "Valor deve ser um número."})
      .positive({ message: "Valor do desconto deve ser positivo." })
  ),
  validUntil: z.preprocess((arg) => {
    // Handles empty string, null, undefined for date, making it effectively optional at input stage if desired
    // but Zod will enforce .date() which means it must be a valid date if not empty.
    if (typeof arg === "string" && arg.trim() === "") return undefined;
    if (arg instanceof Date && !isNaN(arg.valueOf())) return arg;
    if (typeof arg === "string") {
        const date = new Date(arg);
        if (!isNaN(date.valueOf())) return date;
    }
    return undefined; // Let Zod handle "invalid date" or "required" based on schema chaining
  }, z.date({ required_error: "Data de validade é obrigatória.", invalid_type_error: "Data inválida." })),
  type: DiscountTypeEnum,
  // studentId: z.string().uuid().optional().or(z.literal('')), // Example if it's UUID and optional
});

export type DiscountFormData = z.infer<typeof discountSchema>;

// This schema can be used if the API expects validUntil as 'YYYY-MM-DD' string
export const discountApiRequestSchema = discountSchema.extend({
  validUntil: discountSchema.shape.validUntil.transform(date => date.toISOString().split('T')[0]),
});
export type DiscountApiRequestData = z.infer<typeof discountApiRequestSchema>;
