import { z } from 'zod';

// Schema for Login
export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }).min(1, { message: "Email é obrigatório." }), // Reverted to email
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// Schema for Registration
export const registerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Email inválido." }).min(1, { message: "Email é obrigatório." }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string().min(1, { message: "Confirmação de senha é obrigatória." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"], // Path of the error
});
export type RegisterFormData = z.infer<typeof registerSchema>;
