import { z } from 'zod';

export const parentSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório." }),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')), // Allow empty string or valid email
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  // Add other fields from ResponsibleRequest if necessary
});

export type ParentFormData = z.infer<typeof parentSchema>;
