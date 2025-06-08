import { z } from 'zod';

// Schema for User Profile Update
export const userProfileSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório." }),
  phone: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
});
export type UserProfileFormData = z.infer<typeof userProfileSchema>;


// Schema for Password Change
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Senha atual é obrigatória." }),
    newPassword: z.string().min(6, { message: "Nova senha deve ter pelo menos 6 caracteres." }),
    confirmNewPassword: z.string().min(1, { message: "Confirmação da nova senha é obrigatória." }),
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "As novas senhas não coincidem.",
    path: ["confirmNewPassword"],
});
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;


// Schema for User Settings
const notificationSettingsSchema = z.object({
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    paymentReminders: z.boolean().default(true),
    systemUpdates: z.boolean().default(true),
});

const appearanceSettingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    compactMode: z.boolean().default(false),
});

const privacySettingsSchema = z.object({
    shareData: z.boolean().default(false),
    showOnlineStatus: z.boolean().default(true),
});

export const userSettingsSchema = z.object({
    notifications: notificationSettingsSchema,
    appearance: appearanceSettingsSchema,
    privacy: privacySettingsSchema,
});
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
