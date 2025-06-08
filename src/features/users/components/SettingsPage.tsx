import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserSettings, updateUserSettings, UserSettings } from '../services/UserService'; // Assuming UserSettings type from service
import { userSettingsSchema, UserSettingsFormData } from '../types/userSchemas';
import notification from '../../../components/common/Notification.tsx';
import { extractFieldErrors } from '../../../utils/errorUtils.ts';
import ErrorMessage from '../../../components/common/ErrorMessage.tsx';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.tsx';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form as ShadcnForm, FormControl, FormDescription, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Bell, Palette, ShieldCheck, Save } from 'lucide-react'; // Icons

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: currentSettings, isLoading: isLoadingSettings, error: errorSettings, refetch } = useQuery<UserSettings, Error>({
    queryKey: ['userSettings'],
    queryFn: getUserSettings,
  });

  const form = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    // Default values will be set by useEffect once currentSettings are loaded
  });

  useEffect(() => {
    if (currentSettings) {
      form.reset(currentSettings);
    } else { // Set initial defaults if fetching fails or no settings exist
      form.reset({
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          paymentReminders: true,
          systemUpdates: true
        },
        appearance: {
          theme: 'system',
          fontSize: 'medium',
          compactMode: false
        },
        privacy: {
          shareData: false,
          showOnlineStatus: true
        }
      });
    }
  }, [currentSettings, form]);

  const updateSettingsMutation = useMutation<UserSettings, Error, UserSettingsFormData>({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      notification('Configurações atualizadas com sucesso!', 'success');
      queryClient.setQueryData(['userSettings'], data); // Update cache with returned data
      form.reset(data); // Re-initialize form with saved data to ensure consistency
    },
    onError: (error: any) => {
      const apiErrors = extractFieldErrors(error);
      // You could try to map these to form errors if the API returns field-specific error keys
      // e.g. if error is { "notifications.emailNotifications": "Some error" }
      // Object.entries(apiErrors).forEach(([key, message]) => {
      //   form.setError(key as keyof UserSettingsFormData, { type: 'server', message: String(message) });
      // });
      console.error("Error updating settings:", apiErrors);
      notification(`Erro ao atualizar configurações: ${error.message || 'Verifique os dados.'}`, 'error');
    }
  });

  const onSubmit = (data: UserSettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoadingSettings && !currentSettings) { // Show loader only on initial load
    return <LoadingSpinner fullScreen message="Carregando configurações..." />;
  }

  // If there's a fetch error and no data, show it. Otherwise, form can still render with defaults.
  if (errorSettings && !currentSettings) {
      return <ErrorMessage message={`Erro ao carregar configurações: ${errorSettings.message}. Usando padrões.`} title="Erro de Carregamento"/>;
  }


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-6">
        <SettingsIcon className="mr-3 h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold">Configurações</h1>
      </div>

      <ShadcnForm {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
              <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notificações</TabsTrigger>
              <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Aparência</TabsTrigger>
              <TabsTrigger value="privacy"><ShieldCheck className="mr-2 h-4 w-4" />Privacidade</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificações</CardTitle>
                  <CardDescription>Gerencie como você recebe notificações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <ShadcnFormField
                    control={form.control}
                    name="notifications.emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notificações por Email</FormLabel>
                          <FormDescription>Receba atualizações importantes por email.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <ShadcnFormField
                    control={form.control}
                    name="notifications.pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notificações Push</FormLabel>
                          <FormDescription>Receba notificações no navegador ou app.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                   <ShadcnFormField
                    control={form.control}
                    name="notifications.paymentReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Lembretes de Pagamento</FormLabel>
                          <FormDescription>Seja notificado sobre pagamentos pendentes.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                   <ShadcnFormField
                    control={form.control}
                    name="notifications.systemUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Atualizações do Sistema</FormLabel>
                          <FormDescription>Receba informações sobre novas funcionalidades e manutenções.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>Personalize a aparência do sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <ShadcnFormField
                    control={form.control}
                    name="appearance.theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tema" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="system">Padrão do Sistema</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ShadcnFormField
                    control={form.control}
                    name="appearance.fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamanho da Fonte</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tamanho" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="small">Pequeno</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="large">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ShadcnFormField
                    control={form.control}
                    name="appearance.compactMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Modo Compacto</FormLabel>
                          <FormDescription>Reduz o espaçamento para exibir mais conteúdo.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacidade</CardTitle>
                  <CardDescription>Gerencie suas configurações de privacidade.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <ShadcnFormField
                    control={form.control}
                    name="privacy.shareData"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Compartilhar Dados Anônimos</FormLabel>
                          <FormDescription>Ajude a melhorar o sistema compartilhando dados de uso anônimos.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <ShadcnFormField
                    control={form.control}
                    name="privacy.showOnlineStatus"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Mostrar Status Online</FormLabel>
                          <FormDescription>Permitir que outros usuários vejam quando você está online.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-8">
            <Button type="submit" disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? (
                <><LoadingSpinner size={4} className="mr-2" /> Salvando...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Salvar Configurações</>
              )}
            </Button>
          </div>
        </form>
      </ShadcnForm>
    </div>
  );
};

export default SettingsPage;
