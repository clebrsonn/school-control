import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../auth/contexts/AuthProvider';
import { updateUserProfile, UserProfileData } from '../services/UserService'; // Assuming UserProfileData is the request type
import { userProfileSchema, UserProfileFormData } from '../types/userSchemas';
import notification from '../../../components/common/Notification.tsx';
import { extractFieldErrors } from '../../../utils/errorUtils.ts';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Save, Mail, Phone, Building } from 'lucide-react'; // Building for bio/description
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';


const UserProfilePage: React.FC = () => {
  const { user, refreshAuthUser } = useAuth(); // Assuming refreshAuthUser updates the auth context's user
  const queryClient = useQueryClient(); // Though not strictly needed if useAuth().refreshAuthUser() handles cache

  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.name || user?.username || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || user.username || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user, form]);

  const updateUserMutation = useMutation<void, Error, UserProfileFormData>({
    mutationFn: async (data) => {
        // Assuming updateUserProfile service expects an object that matches UserProfileFormData
        // or a specific UserProfileData type.
        // If UserProfileData is different, map `data` to it here.
        // For now, assuming direct compatibility or UserProfileData is UserProfileFormData
        await updateUserProfile(data as UserProfileData);
    },
    onSuccess: async () => {
      notification('Perfil atualizado com sucesso!', 'success');
      setApiErrors({});
      if(refreshAuthUser) await refreshAuthUser(); // Refresh user in auth context
      // queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // If there was a separate query for profile
    },
    onError: (error: any) => {
      const errors = extractFieldErrors(error);
      setApiErrors(errors);

      let errorMessage = 'Erro ao atualizar perfil.';
      const nonFieldErrors = errors.non_field_errors || errors.detail;
      if (nonFieldErrors) {
        errorMessage = nonFieldErrors;
      } else if (Object.keys(errors).length > 0) {
        // Field-specific errors will be shown by mapping to form.setError or via apiFieldErrors state
        errorMessage = 'Alguns campos contêm erros.';
         Object.entries(errors).forEach(([field, message]) => {
            if (field === 'name' || field === 'phone' || field === 'bio') {
                form.setError(field as keyof UserProfileFormData, { type: 'server', message: String(message) });
            }
        });
      } else if (error.message) {
        errorMessage = error.message;
      }
      notification(errorMessage, 'error');
    }
  });

  const onSubmit = (data: UserProfileFormData) => {
    setApiErrors({}); // Clear previous errors
    updateUserMutation.mutate(data);
  };

  if (!user) {
    return <LoadingSpinner fullScreen message="Carregando perfil..." />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-6">
        <UserIcon className="mr-3 h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information Card (Left/Top) */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
              {/* <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.username} /> */}
              <AvatarFallback className="text-3xl">
                {(user.name || user.username || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{form.watch('name') || user.username}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Nome de Usuário:</strong> {user.username}</p>
            <p><strong>Membro desde:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
            <p><strong>Status:</strong> <Badge variant={user.enabled ? "success" : "secondary"}>{user.enabled ? 'Ativo' : 'Inativo'}</Badge></p>
          </CardContent>
        </Card>

        {/* Edit Profile Form Card (Right/Bottom) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editar Informações</CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </CardHeader>
          <CardContent>
            <ShadcnForm {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Nome de Usuário</FormLabel>
                        <FormControl>
                            <Input value={user.username || ''} disabled />
                        </FormControl>
                        <FormDescription>O nome de usuário não pode ser alterado.</FormDescription>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" value={user.email || ''} disabled />
                        </FormControl>
                        <FormDescription>O email não pode ser alterado.</FormDescription>
                    </FormItem>
                </div>

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
                      {apiErrors.name && <p className="text-sm font-medium text-destructive">{apiErrors.name}</p>}
                    </FormItem>
                  )}
                />
                <ShadcnFormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu telefone (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                       {apiErrors.phone && <p className="text-sm font-medium text-destructive">{apiErrors.phone}</p>}
                    </FormItem>
                  )}
                />
                <ShadcnFormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobre Mim</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Uma breve descrição sobre você (opcional)" {...field} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                      {apiErrors.bio && <p className="text-sm font-medium text-destructive">{apiErrors.bio}</p>}
                    </FormItem>
                  )}
                />
                 {apiErrors.non_field_errors && <p className="text-sm font-medium text-destructive">{apiErrors.non_field_errors}</p>}
                 {apiErrors.detail && <p className="text-sm font-medium text-destructive">{apiErrors.detail}</p>}

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? (
                        <><LoadingSpinner size={4} className="mr-2" /> Salvando...</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>
                    )}
                  </Button>
                </div>
              </form>
            </ShadcnForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
