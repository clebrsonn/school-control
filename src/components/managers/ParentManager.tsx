import React, { useState } from 'react';
import notification from '../common/Notification.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parentSchema, ParentFormData } from '@/features/parents/types/parentSchemas.ts';
import {
    createResponsible,
    deleteResponsible,
    getAllResponsibles,
    updateResponsible,
} from '../../features/parents/services/ParentService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { ResponsibleRequest, ResponsibleResponse, PageResponse } from '../../features/parents/types/ResponsibleTypes.ts';
import { Users2, List, Save, Undo } from 'lucide-react'; // Users2 for FaUsers
import { extractFieldErrors } from '../../utils/errorUtils.ts';

// Shadcn/UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

const ParentManager: React.FC = () => {
    const [editingParent, setEditingParent] = useState<ResponsibleResponse | null>(null);
    const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(0);

    const form = useForm<ParentFormData>({
        resolver: zodResolver(parentSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
        }
    });

    const {
        data: parentPage,
        isLoading: isLoadingParents,
        error: errorParents,
        refetch: refetchParents,
    } = useQuery<PageResponse<ResponsibleResponse>, Error>({
        queryKey: ['parents', currentPage],
        queryFn: () => getAllResponsibles({ page: currentPage, size: 10, sort: 'name' }),
    });

    const createParentMutation = useMutation<ResponsibleResponse, Error, ParentFormData>({
        mutationFn: (parentData) => createResponsible(parentData as ResponsibleRequest),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents', currentPage] });
            notification('Responsável adicionado com sucesso!', 'success');
            form.reset();
            setEditingParent(null);
            setApiFieldErrors({});
        },
        onError: (error: any) => {
            const errors = extractFieldErrors(error);
            setApiFieldErrors(errors);
            notification(`Erro ao adicionar responsável: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    const updateParentMutation = useMutation<ResponsibleResponse, Error, { id: string; parentData: ParentFormData }>({
        mutationFn: ({ id, parentData }) => updateResponsible(id, parentData as ResponsibleRequest),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents', currentPage] });
            notification('Responsável atualizado com sucesso!', 'success');
            form.reset();
            setEditingParent(null);
            setApiFieldErrors({});
        },
        onError: (error: any) => {
            const errors = extractFieldErrors(error);
            setApiFieldErrors(errors);
            notification(`Erro ao atualizar responsável: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    const deleteParentMutation = useMutation<void, Error, string>({
        mutationFn: deleteResponsible,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents', currentPage] });
            notification('Responsável removido com sucesso!', 'success');
            if (editingParent) {
                 clearFormAndEditingState();
            }
        },
        onError: (error: any) => {
            notification(`Erro ao remover responsável: ${error.message || 'Erro desconhecido.'}`, 'error');
        }
    });

    const clearFormAndEditingState = () => {
        form.reset({ name: '', email: '', phone: '', address: '' });
        setEditingParent(null);
        setApiFieldErrors({});
    };

    const onSubmit = (data: ParentFormData) => {
        setApiFieldErrors({});
        if (editingParent) {
            updateParentMutation.mutate({ id: editingParent.id, parentData: data });
        } else {
            createParentMutation.mutate(data);
        }
    };

    const handleEditParent = (parent: ResponsibleResponse) => {
        setEditingParent(parent);
        form.reset({
            name: parent.name,
            email: parent.email || '',
            phone: parent.phone || '',
            address: parent.address || '',
        });
        setApiFieldErrors({});
    };

    const handleDeleteParent = (id: string) => {
        deleteParentMutation.mutate(id);
    };

    if (isLoadingParents && !parentPage) { // Show full page loader only on initial load
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold flex items-center">
                    <Users2 className="mr-2 h-6 w-6" />
                    Gerenciar Responsáveis
                </h1>
            </div>

            {errorParents && !parentPage && <ErrorMessage message={`Erro ao carregar responsáveis: ${errorParents.message}`} />}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {editingParent ? 'Editar Responsável' : 'Adicionar Responsável'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <ShadcnForm {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ShadcnFormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome do Responsável" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.name && !form.formState.errors.name && <p className="text-sm font-medium text-destructive">{apiFieldErrors.name}</p>}
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
                                                <Input placeholder="Telefone do Responsável" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.phone && !form.formState.errors.phone && <p className="text-sm font-medium text-destructive">{apiFieldErrors.phone}</p>}
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ShadcnFormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Email do Responsável" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.email && !form.formState.errors.email && <p className="text-sm font-medium text-destructive">{apiFieldErrors.email}</p>}
                                        </FormItem>
                                    )}
                                />
                                 <ShadcnFormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Endereço</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Endereço do Responsável" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.address && !form.formState.errors.address && <p className="text-sm font-medium text-destructive">{apiFieldErrors.address}</p>}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex pt-4 space-x-2">
                                <Button type="submit" disabled={createParentMutation.isPending || updateParentMutation.isPending}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {createParentMutation.isPending || updateParentMutation.isPending
                                        ? (editingParent ? 'Atualizando...' : 'Salvando...')
                                        : (editingParent ? 'Atualizar' : 'Salvar')
                                    }
                                </Button>
                                {editingParent && (
                                    <Button type="button" variant="outline" onClick={clearFormAndEditingState}>
                                        <Undo className="mr-2 h-4 w-4" />
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </ShadcnForm>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <List className="mr-2 h-5 w-5" />
                        Lista de Responsáveis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingParents && parentPage && <div className="text-center p-4"><LoadingSpinner /></div>}
                    {!isLoadingParents && errorParents && <ErrorMessage message={`Erro ao carregar lista: ${errorParents.message}`} />}
                    {!isLoadingParents && !errorParents && parentPage && (
                         <ListRegistries
                            page={parentPage}
                            entityName="parents" // Pass a more generic or specific name if needed for ListRegistries
                            onDelete={handleDeleteParent}
                            onEdit={handleEditParent}
                            onPageChange={(page) => setCurrentPage(page - 1)}
                            // Define columns for parents if ListRegistries is generic
                            // columns={[{ accessor: 'name', Header: 'Nome' }, { accessor: 'email', Header: 'Email' }, { accessor: 'phone', Header: 'Telefone' }]}
                        />
                    )}
                     {!isLoadingParents && !errorParents && !parentPage?.content.length && (
                        <p className="text-center text-muted-foreground py-4">Nenhum responsável encontrado.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ParentManager;
