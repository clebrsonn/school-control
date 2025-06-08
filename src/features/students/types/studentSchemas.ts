import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal('')), // Allow empty string or valid email
  responsibleId: z.string().min(1, { message: "Responsável é obrigatório" }),
  classroomId: z.string().min(1, { message: "Turma é obrigatória" }),
  enrollmentFee: z.preprocess(
    (val) => parseFloat(String(val)), // Convert string input to number
    z.number().positive({ message: "Taxa de matrícula deve ser um número positivo" })
  ),
  monthlyFee: z.preprocess(
    (val) => parseFloat(String(val)), // Convert string input to number
    z.number().positive({ message: "Mensalidade deve ser um número positivo" })
  ),
  // Add other fields from StudentRequest if necessary, matching their types
  // For example, if StudentRequest has an 'id', it might not be part of creation schema directly
  // but could be part of an update schema.
  // For now, focusing on fields mentioned in the prompt for creation/update.
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Example of how you might define an update schema if it differs (e.g. ID is present)
// export const studentUpdateSchema = studentSchema.extend({
//   id: z.string(),
// });
// export type StudentUpdateFormData = z.infer<typeof studentUpdateSchema>;
