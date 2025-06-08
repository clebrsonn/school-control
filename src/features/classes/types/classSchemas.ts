import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(1, { message: "Nome da turma é obrigatório." }),
  // Assuming schoolYear is the 'year' field mentioned in prompt.
  // ClassRoomRequest uses schoolYear: string, but it's treated as a year.
  // Zod schema will parse to number for validation then it can be converted back to string if API needs string.
  schoolYear: z.preprocess(
    (val) => String(val).trim() ? parseInt(String(val).trim(), 10) : undefined, // Allow empty string to become undefined, then default or handle
    z.number({required_error: "Ano letivo é obrigatório."}).min(2000, "Ano inválido.").max(new Date().getFullYear() + 5, "Ano inválido.")
  ),
  startTime: z.string().optional().or(z.literal('')), // Format HH:MM
  endTime: z.string().optional().or(z.literal('')),   // Format HH:MM
  description: z.string().optional().or(z.literal('')),
});

export type ClassFormData = z.infer<typeof classSchema>;

// For mutations, if the backend expects schoolYear as string:
export const classApiSchema = classSchema.extend({
    schoolYear: classSchema.shape.schoolYear.transform(String)
});
export type ClassApiData = z.infer<typeof classApiSchema>;
