import { z } from 'zod';

export const enrollmentSchema = z.object({
  classRoomId: z.string().min(1, { message: "Turma é obrigatória." }),
  enrollmentFee: z.preprocess(
    // Allows empty string, which parseFloat would turn into NaN. Coerce to undefined for optional validation.
    (val) => (String(val).trim() === "" ? undefined : parseFloat(String(val).replace(',', '.'))),
    z.number().nonnegative({ message: "Taxa de matrícula não pode ser negativa." }).optional()
  ),
  monthlyFee: z.preprocess( // Corrected spelling for form data
    (val) => (String(val).trim() === "" ? undefined : parseFloat(String(val).replace(',', '.'))),
    z.number().nonnegative({ message: "Mensalidade não pode ser negativa." }).optional()
  ),
  // studentId will be added from context (e.g., current student page ID)
});

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

// Schema for transforming to the API request structure, including the 'monthyFee' typo
export const enrollmentApiRequestSchema = enrollmentSchema.transform(data => {
    const { monthlyFee, ...rest } = data;
    return {
        ...rest,
        monthyFee: monthlyFee, // Map to 'monthyFee' with typo for the API
        enrollmentFee: data.enrollmentFee === undefined ? 0 : data.enrollmentFee,
        // monthlyFee: data.monthlyFee === undefined ? 0 : data.monthlyFee, // Removed duplicate
    };
});
export type EnrollmentApiRequestData = z.infer<typeof enrollmentApiRequestSchema>;
