import React, { useState } from 'react';
import notification from '../common/Notification.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classSchema, ClassFormData, classApiSchema } from '@/features/classes/types/classSchemas.ts';
import {
    createClassRoom,
    deleteClassRoom,
    getAllClassRooms,
    updateClassRoom,
} from '../../features/classes/services/ClassService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { ClassRoomRequest, ClassRoomResponse, PageResponse } from '../../features/classes/types/ClassRoomTypes.ts';
import { School, List, Save, Undo } from 'lucide-react';
import { extractFieldErrors } from '../../utils/errorUtils.ts';

// Shadcn/UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // For description
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

const ClassManager: React.FC = () => {
    const [editingClass, setEditingClass] = useState<ClassRoomResponse | null>(null);
    const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(0);

    const form = useForm<ClassFormData>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: '',
            schoolYear: new Date().getFullYear(), // Default to current year
            startTime: '',
            endTime: '',
            description: '',
        }
    });

    const {
        data: classPage,
        isLoading: isLoadingClasses,
        error: errorClasses,
        refetch: refetchClasses,
    } = useQuery<PageResponse<ClassRoomResponse>, Error>({
        queryKey: ['classrooms', currentPage],
        queryFn: () => getAllClassRooms({ page: currentPage, size: 10, sort: 'name' }),
    });

    // Mutation to create a class
    const createClassMutation = useMutation<ClassRoomResponse, Error, ClassFormData>({
        mutationFn: async (formData) => {
            // Validate and transform data for API (e.g. schoolYear to string if needed)
            const apiData = classApiSchema.parse(formData);
            return createClassRoom(apiData as ClassRoomRequest);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classrooms', currentPage] });
            notification('Turma adicionada com sucesso!', 'success');
            form.reset();
            setEditingClass(null);
            setApiFieldErrors({});
        },
        onError: (error: any) => {
            const errors = extractFieldErrors(error);
            setApiFieldErrors(errors);
            notification(`Erro ao adicionar turma: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    // Mutation to update a class
    const updateClassMutation = useMutation<ClassRoomResponse, Error, { id: string; classData: ClassFormData }>({
        mutationFn: async ({ id, classData }) => {
            const apiData = classApiSchema.parse(classData);
            return updateClassRoom(id, apiData as ClassRoomRequest);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classrooms', currentPage] });
            notification('Turma atualizada com sucesso!', 'success');
            form.reset();
            setEditingClass(null);
            setApiFieldErrors({});
        },
        onError: (error: any) => {
            const errors = extractFieldErrors(error);
            setApiFieldErrors(errors);
            notification(`Erro ao atualizar turma: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    // Mutation to delete a class
    const deleteClassMutation = useMutation<void, Error, string>({
        mutationFn: deleteClassRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classrooms', currentPage] });
            notification('Turma removida com sucesso!', 'success');
            if (editingClass) {
                clearFormAndEditingState();
            }
        },
        onError: (error: any) => {
            notification(`Erro ao remover turma: ${error.message || 'Erro desconhecido.'}`, 'error');
        }
    });

    const clearFormAndEditingState = () => {
        form.reset({
            name: '',
            schoolYear: new Date().getFullYear(),
            startTime: '',
            endTime: '',
            description: ''
        });
        setEditingClass(null);
        setApiFieldErrors({});
    };

    const onSubmit = (data: ClassFormData) => {
        setApiFieldErrors({});
        if (editingClass) {
            updateClassMutation.mutate({ id: editingClass.id, classData: data });
        } else {
            createClassMutation.mutate(data);
        }
    };

    const handleEditClass = (cls: ClassRoomResponse) => {
        setEditingClass(cls);
        form.reset({
            name: cls.name,
            schoolYear: parseInt(cls.schoolYear,10) || new Date().getFullYear(), // Ensure schoolYear is number for form
            startTime: cls.startTime || '',
            endTime: cls.endTime || '',
            description: cls.description || '',
        });
        setApiFieldErrors({});
    };

    const handleDeleteClass = (id: string) => {
        deleteClassMutation.mutate(id);
    };

    if (isLoadingClasses && !classPage) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold flex items-center">
                    <School className="mr-2 h-6 w-6" />
                    Gerenciar Turmas
                </h1>
            </div>

            {errorClasses && !classPage && <ErrorMessage message={`Erro ao carregar turmas: ${errorClasses.message}`} title="Erro de Carregamento"/>}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {editingClass ? 'Editar Turma' : 'Adicionar Turma'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <ShadcnForm {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <ShadcnFormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Turma</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Turma A, 1º Ano Manhã" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        {apiFieldErrors.name && !form.formState.errors.name && <p className="text-sm font-medium text-destructive">{apiFieldErrors.name}</p>}
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ShadcnFormField
                                    control={form.control}
                                    name="schoolYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ano Letivo</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 2024" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.schoolYear && !form.formState.errors.schoolYear && <p className="text-sm font-medium text-destructive">{apiFieldErrors.schoolYear}</p>}
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Horário de Início (HH:MM)</FormLabel>
                                            <FormControl>
                                                <Input type="time" placeholder="Ex: 08:00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.startTime && !form.formState.errors.startTime && <p className="text-sm font-medium text-destructive">{apiFieldErrors.startTime}</p>}
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={form.control}
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Horário de Término (HH:MM)</FormLabel>
                                            <FormControl>
                                                <Input type="time" placeholder="Ex: 12:00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.endTime && !form.formState.errors.endTime && <p className="text-sm font-medium text-destructive">{apiFieldErrors.endTime}</p>}
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <ShadcnFormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição (Opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Qualquer observação adicional sobre a turma." {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                        {apiFieldErrors.description && !form.formState.errors.description && <p className="text-sm font-medium text-destructive">{apiFieldErrors.description}</p>}
                                    </FormItem>
                                )}
                            />

                            <div className="flex pt-4 space-x-2">
                                <Button type="submit" disabled={createClassMutation.isPending || updateClassMutation.isPending}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {createClassMutation.isPending || updateClassMutation.isPending
                                        ? (editingClass ? 'Atualizando...' : 'Salvando...')
                                        : (editingClass ? 'Atualizar' : 'Salvar')
                                    }
                                </Button>
                                {editingClass && (
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
                        Lista de Turmas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingClasses && classPage && <div className="text-center p-4"><LoadingSpinner /></div> }
                    {!isLoadingClasses && errorClasses && <ErrorMessage message={`Erro ao carregar lista de turmas: ${errorClasses.message}`} />}
                    {!isLoadingClasses && !errorClasses && classPage && (
                         <ListRegistries
                            page={classPage}
                            entityName="classes"
                            onDelete={handleDeleteClass}
                            onEdit={handleEditClass}
                            onPageChange={(page) => setCurrentPage(page - 1)}
                            // Define columns for classes if ListRegistries is generic
                            // columns={[{ accessor: 'name', Header: 'Nome' }, { accessor: 'schoolYear', Header: 'Ano' }, { accessor: 'startTime', Header: 'Início'}, { accessor: 'endTime', Header: 'Término'}]}
                        />
                    )}
                     {!isLoadingClasses && !errorClasses && !classPage?.content.length && (
                        <p className="text-center text-muted-foreground py-4">Nenhuma turma encontrada.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ClassManager;
