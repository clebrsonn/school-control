import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, ExpenseFormData } from '../types/expenseSchemas.ts';
import { ExpenseService } from '../services/ExpenseService.ts';
import notification from '../../../components/common/Notification.tsx';
import { extractFieldErrors } from '../../../utils/errorUtils.ts';
import { Expense } from '../types/ExpenseTypes.ts';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form as ShadcnForm, FormControl, FormDescription, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Save } from 'lucide-react';
// For DatePicker - if chosen over input type="date"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils"; // if using Popover Calendar
// import { format } from "date-fns";


interface ExpenseFormProps {
  onSuccess?: () => void;
  initialData?: Partial<Expense>; // Allow partial for new, full for edit
  onCancel?: () => void; // Added for better modal control
}

// Example categories - this would ideally come from a config or API
const expenseCategories = ["Alimentação", "Transporte", "Material", "Outros"];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, initialData, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  // For file input, react-hook-form doesn't control it directly in the same way.
  // We'll get its value via form.watch() or a separate ref if needed for FormData.
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      amount: initialData?.value || 0, // 'value' in Expense, 'amount' in schema
      description: initialData?.description || '',
      category: initialData?.category || '',
      // receipt: undefined, // File input is handled separately
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        date: initialData.date ? new Date(initialData.date) : new Date(),
        amount: initialData.value || 0,
        description: initialData.description || '',
        category: initialData.category || '',
      });
      // Note: receipt file cannot be reset here easily if it was part of initialData
    } else {
        form.reset({ // Default for new form
            date: new Date(),
            amount: 0,
            description: '',
            category: '',
        });
    }
  }, [initialData, form]);


  const onSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true);
    form.clearErrors(); // Clear previous errors

    const formDataPayload = new FormData();
    formDataPayload.append('date', data.date.toISOString().split('T')[0]); // Format date as YYYY-MM-DD
    formDataPayload.append('value', String(data.amount)); // 'amount' from schema
    formDataPayload.append('description', data.description);
    if (data.category) {
      formDataPayload.append('category', data.category);
    }
    if (receiptFile) {
      formDataPayload.append('receipt', receiptFile);
    }

    try {
      if (initialData?.id) {
        await ExpenseService.update(initialData.id, formDataPayload);
        notification('Despesa atualizada com sucesso!', 'success');
      } else {
        await ExpenseService.create(formDataPayload);
        notification('Despesa cadastrada com sucesso!', 'success');
      }
      form.reset();
      setReceiptFile(null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      const apiErrors = extractFieldErrors(error);

      let hasSetError = false;
      Object.keys(apiErrors).forEach(key => {
        if (key in form.getValues()) { // Check if error key is a form field
          form.setError(key as keyof ExpenseFormData, { type: 'server', message: apiErrors[key] });
          hasSetError = true;
        }
      });

      if (!hasSetError) {
        notification('Erro ao salvar despesa: ' + (error.message || 'Verifique os campos e tente novamente.'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ShadcnForm {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ShadcnFormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                {/* Using Input type="date". Can be upgraded to Shadcn DatePicker later */}
                <Input
                    type="date"
                    {...field}
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                    onChange={e => field.onChange(e.target.valueAsDate || new Date(e.target.value))} // Ensure it passes Date object
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ShadcnFormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''} // Handle 0 or undefined for placeholder
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    step="0.01"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ShadcnFormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição da despesa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ShadcnFormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value=""><em>Nenhuma</em></SelectItem>
                            {expenseCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormItem>
            <FormLabel>Comprovante (Opcional)</FormLabel>
            <FormControl>
                <Input
                    type="file"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png,application/pdf"
                />
            </FormControl>
            <FormDescription>Formatos: JPG, PNG, PDF. Tamanho máx: 5MB.</FormDescription>
            {/* TODO: Display error for receipt if API returns one, e.g. fieldErrors.receipt */}
        </FormItem>

        <div className="flex justify-end space-x-2 pt-4">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>}
            <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : initialData?.id ? 'Atualizar Despesa' : 'Cadastrar Despesa'}
            </Button>
        </div>
      </form>
    </ShadcnForm>
  );
};
