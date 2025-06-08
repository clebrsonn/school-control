import React, { useState } from 'react';
import notification from '../common/Notification.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { discountSchema, DiscountFormData, discountApiRequestSchema } from '@/features/discounts/types/discountSchemas.ts'; // Ensure path is correct
import {
    createDiscount,
    deleteDiscount,
    fetchDiscounts,
    updateDiscount, // Assuming an updateDiscount service function exists or will be created
} from '../../features/enrollments/services/DiscountService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { DiscountRequest, DiscountResponse, PageResponse } from '../../features/billing/types/Discount.ts'; // Ensure correct Discount types
import { Percent, List, Save, Undo } from 'lucide-react';
import { extractFieldErrors } from '../../utils/errorUtils.ts';

// Shadcn/UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { discountTypes } from '@/features/discounts/types/discountSchemas.ts';


const DiscountManager: React.FC = () => {
    const [editingDiscount, setEditingDiscount] = useState<DiscountResponse | null>(null);
    const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(0);

    const form = useForm<DiscountFormData>({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            name: '',
            value: 0,
            validUntil: new Date(), // Default to today, or make it undefined and handle in schema/UI
            type: 'MATRICULA',
        }
    });

    const {
        data: discountPage,
        isLoading: isLoadingDiscounts,
        error: errorDiscounts,
    } = useQuery<PageResponse<DiscountResponse>, Error>({
        queryKey: ['discounts', currentPage],
        queryFn: () => fetchDiscounts(currentPage, 10), // Assuming fetchDiscounts takes page and size
    });

    const createDiscountMutation = useMutation<DiscountResponse, Error, DiscountFormData>({
        mutationFn: async (formData) => {
            const apiData = discountApiRequestSchema.parse(formData); // Transform data for API
            return createDiscount(apiData as DiscountRequest);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts', currentPage] });
            notification('Desconto adicionado com sucesso!', 'success');
            clearFormAndEditingState();
        },
        onError: (error: any) => {
            const errors = extractFieldErrors(error);
            setApiFieldErrors(errors);
            notification(`Erro ao adicionar desconto: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    const updateDiscountMutation = useMutation<DiscountResponse, Error, { id: string; discountData: DiscountFormData }>({
        mutationFn: async ({ id, discountData }) => {
            const apiData = discountApiRequestSchema.parse(discountData);
            // Assuming an updateDiscount service function exists:
            return updateDiscount(id, apiData as DiscountRequest);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts', currentPage] });
            notification('Desconto atualizado com sucesso!', 'success');
            clearFormAndEditingState();
        },
        onError: (error: any) => {
            const errors = extractFieldErrors(error);
            setApiFieldErrors(errors);
            notification(`Erro ao atualizar desconto: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    const deleteDiscountMutation = useMutation<void, Error, string>({
        mutationFn: deleteDiscount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts', currentPage] });
            notification('Desconto removido com sucesso!', 'success');
            if (editingDiscount) {
                clearFormAndEditingState();
            }
        },
        onError: (error: any) => {
            notification(`Erro ao remover desconto: ${error.message || 'Erro desconhecido.'}`, 'error');
        }
    });

    const clearFormAndEditingState = () => {
        form.reset({
            name: '',
            value: 0,
            validUntil: new Date(),
            type: 'MATRICULA'
        });
        setEditingDiscount(null);
        setApiFieldErrors({});
    };

    const onSubmit = (data: DiscountFormData) => {
        setApiFieldErrors({});
        if (editingDiscount) {
            updateDiscountMutation.mutate({ id: editingDiscount.id, discountData: data });
        } else {
            createDiscountMutation.mutate(data);
        }
    };

    const handleEditDiscount = (discount: DiscountResponse) => {
        setEditingDiscount(discount);
        form.reset({
            name: discount.name,
            value: discount.value,
            validUntil: new Date(discount.validUntil), // Ensure date is a Date object for the form
            type: discount.type,
        });
        setApiFieldErrors({});
    };

    const handleDeleteDiscount = (id: string) => {
        deleteDiscountMutation.mutate(id);
    };

    if (isLoadingDiscounts && !discountPage) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold flex items-center">
                    <Percent className="mr-2 h-6 w-6" />
                    Gerenciar Descontos
                </h1>
            </div>

            {errorDiscounts && !discountPage && <ErrorMessage message={`Erro ao carregar descontos: ${errorDiscounts.message}`} title="Erro de Carregamento"/>}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {editingDiscount ? 'Editar Desconto' : 'Adicionar Desconto'}
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
                                        <FormLabel>Nome do Desconto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Desconto de Férias" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        {apiFieldErrors.name && !form.formState.errors.name && <p className="text-sm font-medium text-destructive">{apiFieldErrors.name}</p>}
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ShadcnFormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valor (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 10 para 10%" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.value && !form.formState.errors.value && <p className="text-sm font-medium text-destructive">{apiFieldErrors.value}</p>}
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Válido Até</FormLabel>
                                            <FormControl>
                                                {/* Using Input type="date". Can be replaced with Shadcn DatePicker later. */}
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                                    onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.validUntil && !form.formState.errors.validUntil && <p className="text-sm font-medium text-destructive">{apiFieldErrors.validUntil}</p>}
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Desconto</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {discountTypes.map(typeVal => (
                                                        <SelectItem key={typeVal} value={typeVal}>
                                                            {typeVal === 'MATRICULA' ? 'Matrícula' : 'Mensalidade'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            {apiFieldErrors.type && !form.formState.errors.type && <p className="text-sm font-medium text-destructive">{apiFieldErrors.type}</p>}
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* TODO: Add StudentId select if discounts can be per student */}

                            <div className="flex pt-4 space-x-2">
                                <Button type="submit" disabled={createDiscountMutation.isPending || updateDiscountMutation.isPending}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {createDiscountMutation.isPending || updateDiscountMutation.isPending
                                        ? (editingDiscount ? 'Atualizando...' : 'Salvando...')
                                        : (editingDiscount ? 'Atualizar' : 'Salvar Desconto')
                                    }
                                </Button>
                                {editingDiscount && (
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
                        Lista de Descontos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingDiscounts && discountPage && <div className="text-center p-4"><LoadingSpinner /></div> }
                    {!isLoadingDiscounts && errorDiscounts && <ErrorMessage message={`Erro ao carregar descontos: ${errorDiscounts.message}`} />}
                    {!isLoadingDiscounts && !errorDiscounts && discountPage && (
                         <ListRegistries
                            page={discountPage} // Ensure DiscountResponse has common fields like 'id' and 'name' or adapt ListRegistries
                            entityName="discounts"
                            onDelete={handleDeleteDiscount}
                            onEdit={handleEditDiscount} // Make sure DiscountResponse is compatible with what handleEdit expects
                            onPageChange={(page) => setCurrentPage(page - 1)}
                            // Example columns if ListRegistries is generic:
                            // columns={[
                            //   { accessor: 'name', Header: 'Nome' },
                            //   { accessor: 'value', Header: 'Valor (%)' },
                            //   { accessor: 'type', Header: 'Tipo' },
                            //   { accessor: 'validUntil', Header: 'Válido Até', Cell: ({ value }) => new Date(value).toLocaleDateString() },
                            // ]}
                        />
                    )}
                     {!isLoadingDiscounts && !errorDiscounts && !discountPage?.content.length && (
                        <p className="text-center text-muted-foreground py-4">Nenhum desconto encontrado.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DiscountManager;
