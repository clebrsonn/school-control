import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../types/authSchemas';
import { useAuth } from '../contexts/AuthProvider';
import notification from '../../../components/common/Notification.tsx';
import { extractFieldErrors } from '../../../utils/errorUtils.ts';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserPlus } from 'lucide-react'; // Icon

const RegisterPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        form.clearErrors();

        try {
            // The 'confirmPassword' field is only for client-side validation by Zod.
            // We only send name, email, password to the register function.
            await register({ name: data.name, email: data.email, password: data.password });
            notification('Registro bem-sucedido! Você será redirecionado.', 'success');
            // Navigation to login or dashboard will likely be handled by AuthProvider
            // or you can navigate explicitly here after a delay for the notification.
            // navigate('/login');
        } catch (error: any) {
            const apiErrors = extractFieldErrors(error);
            let errorMessage = "Falha no registro. Verifique os dados fornecidos.";

            if (Object.keys(apiErrors).length > 0) {
                 Object.entries(apiErrors).forEach(([field, message]) => {
                    if (field === 'name' || field === 'email' || field === 'password' || field === 'non_field_errors' || field === 'detail') {
                        form.setError(field === 'non_field_errors' || field === 'detail' ? 'root.serverError' : field as keyof RegisterFormData, {
                            type: 'server',
                            message: message,
                        });
                    }
                });
                if (apiErrors.non_field_errors) errorMessage = apiErrors.non_field_errors;
                else if (apiErrors.detail) errorMessage = apiErrors.detail;
                // More specific error messages can be set if needed
            } else if (error.message) {
                errorMessage = error.message;
            }

            if (!form.formState.isValid && (form.formState.errors.email || form.formState.errors.password || form.formState.errors.name || form.formState.errors.confirmPassword)){
                // Zod errors will be shown by FormMessage
            } else {
                 notification(errorMessage, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <UserPlus className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                    <CardDescription>Preencha os dados abaixo para criar sua conta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ShadcnForm {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* Reduced space for more fields */}
                            <ShadcnFormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu nome completo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <ShadcnFormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="seu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <ShadcnFormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Crie uma senha" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <ShadcnFormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirme sua senha" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.formState.errors.root?.serverError && (
                                <p className="text-sm font-medium text-destructive">
                                    {form.formState.errors.root.serverError.message}
                                </p>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Registrando...' : 'Registrar'}
                            </Button>
                        </form>
                    </ShadcnForm>
                    <div className="mt-6 text-center text-sm">
                        Já possui uma conta?{' '}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Faça login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterPage;
