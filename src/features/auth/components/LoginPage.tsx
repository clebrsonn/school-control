import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../types/authSchemas';
import { useAuth } from '../contexts/AuthProvider';
import notification from '../../../components/common/Notification.tsx'; // Assuming this is preferred over Shadcn toast for now
import { extractFieldErrors } from '../../../utils/errorUtils.ts';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LogIn } from 'lucide-react'; // Icon

const LoginPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false); // For submission loading state
    const { login } = useAuth();
    const navigate = useNavigate();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '', // Changed from email
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        form.clearErrors(); // Clear previous errors

        try {
            // Use data.username from LoginFormData, which is now { username: string, password: string }
            await login(data.username, data.password);
            // Navigation to dashboard or intended page will be handled by AuthProvider via useEffect on user state change
        } catch (error: any) {
            const apiErrors = extractFieldErrors(error);
            let errorMessage = "Falha no login. Verifique suas credenciais.";

            if (Object.keys(apiErrors).length > 0) {
                Object.entries(apiErrors).forEach(([field, message]) => {
                    // Check against 'username' now instead of 'email' for field-specific errors
                    if (field === 'username' || field === 'password' || field === 'non_field_errors' || field === 'detail') {
                        form.setError(field === 'non_field_errors' || field === 'detail' ? 'root.serverError' : field as keyof LoginFormData, {
                            type: 'server',
                            message: message as string,
                        });
                    }
                });
                if (apiErrors.non_field_errors) errorMessage = apiErrors.non_field_errors;
                else if (apiErrors.detail) errorMessage = apiErrors.detail;
                else if (apiErrors.username) errorMessage = apiErrors.username; // Check for username error
                else if (apiErrors.password) errorMessage = apiErrors.password;

            } else if (error.message) {
                errorMessage = error.message;
            }

            // Check form.formState.errors for 'username' instead of 'email'
            if (!form.formState.isValid && (form.formState.errors.username || form.formState.errors.password)){
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
                        <LogIn className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">School Control</CardTitle>
                    <CardDescription>Entre com suas credenciais para acessar o sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ShadcnForm {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <ShadcnFormField
                                control={form.control}
                                name="username" // Changed from email to username
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Usuário</FormLabel> {/* Changed label */}
                                        <FormControl>
                                            <Input type="text" placeholder="Seu nome de usuário" {...field} /> {/* Changed type and placeholder */}
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
                                            <Input type="password" placeholder="Sua senha" {...field} />
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
                                {isLoading ? 'Entrando...' : 'Login'}
                            </Button>
                        </form>
                    </ShadcnForm>
                    <div className="mt-6 text-center text-sm">
                        <Link to="#" className="text-primary hover:underline"> {/* Replace # with actual forgot password route */}
                            Esqueceu sua senha?
                        </Link>
                    </div>
                    <div className="mt-2 text-center text-sm">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="font-medium text-primary hover:underline">
                            Registre-se
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
