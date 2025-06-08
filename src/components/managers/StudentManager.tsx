import React, { useEffect, useState } from 'react';
import notification from '../common/Notification.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, StudentFormData } from '@/features/students/types/studentSchemas.ts'; // Ensure this path is correct
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    updateStudent
} from '../../features/students/services/StudentService.ts';
import { getAllResponsibles, getStudentsByResponsibleId } from '../../features/parents/services/ParentService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { getAllClassRooms } from '../../features/classes/services/ClassService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes.ts';
import { ResponsibleResponse } from '../../features/parents/types/ResponsibleTypes.ts';
import { StudentRequest, StudentResponse, PageResponse } from '../../features/students/types/StudentTypes.ts'; // Assuming PageResponse is here
import { GraduationCap, List, Save, Undo } from 'lucide-react';
import { extractFieldErrors } from '../../utils/errorUtils.ts';

// Shadcn/UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface StudentManagerProps {
    responsible?: string; // Optional as per original logic where it might not be provided
}

const StudentManager: React.FC<StudentManagerProps> = ({ responsible }) => {
    const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
    const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(0);

    const form = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            name: '',
            email: '',
            responsibleId: responsible || '',
            classroomId: '',
            enrollmentFee: 0,
            monthlyFee: 0,
        }
    });
     // Effect to update default responsibleId in form when prop changes (e.g. navigating to this page with a new responsible context)
     useEffect(() => {
        if (responsible) {
            form.setValue('responsibleId', responsible);
        }
    }, [responsible, form]);


    const { data: classesData = [], isLoading: isLoadingClasses, error: errorClasses } = useQuery<ClassRoomResponse[], Error>({
        queryKey: ['classrooms'],
        queryFn: async () => {
            const response = await getAllClassRooms({ page: 0, size: 500 });
            return response.content;
        }
    });

    const { data: parentsData = [], isLoading: isLoadingParents, error: errorParents } = useQuery<ResponsibleResponse[], Error>({
        queryKey: ['responsibles'],
        queryFn: async () => {
            const response = await getAllResponsibles({ page: 0, size: 500, sort: 'name' });
            return response.content;
        },
        enabled: !responsible
    });

    const {
        data: studentPage,
        isLoading: isLoadingStudents,
        error: errorStudents,
        refetch: refetchStudents, // Keep refetch for manual refresh if needed elsewhere
    } = useQuery<PageResponse<StudentResponse>, Error>({ // Specify PageResponse type
        queryKey: ['students', currentPage, responsible],
        queryFn: () => responsible
            ? getStudentsByResponsibleId(responsible, { page: currentPage, size: 10 })
            : getAllStudents({ page: currentPage, size: 10, sort: 'name,responsible' }),
    });

    const createStudentMutation = useMutation<StudentResponse, Error, StudentFormData>({
        mutationFn: (studentData) => {
            // Map StudentFormData to StudentRequest if necessary
            const requestData: StudentRequest = {
                ...studentData,
                classroom: studentData.classroomId, // Map classroomId to classroom
                monthyFee: studentData.monthlyFee, // Ensure correct field name if backend expects 'monthyFee'
            };
            return createStudent(requestData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students', currentPage, responsible] });
            notification('Aluno adicionado com sucesso!', 'success');
            form.reset();
            setEditingStudent(null);
            setApiFieldErrors({});
        },
        onError: (error: any) => {
            const apiErrors = extractFieldErrors(error);
            setApiFieldErrors(apiErrors);
            notification(`Erro ao adicionar aluno: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    const updateStudentMutation = useMutation<StudentResponse, Error, { id: string; studentData: StudentFormData }>({
        mutationFn: ({ id, studentData }) => {
            const requestData: StudentRequest = {
                ...studentData,
                classroom: studentData.classroomId,
                monthyFee: studentData.monthlyFee,
            };
            return updateStudent(id, requestData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students', currentPage, responsible] });
            notification('Aluno atualizado com sucesso!', 'success');
            form.reset();
            setEditingStudent(null);
            setApiFieldErrors({});
        },
        onError: (error: any) => {
            const apiErrors = extractFieldErrors(error);
            setApiFieldErrors(apiErrors);
            notification(`Erro ao atualizar aluno: ${error.message || 'Verifique os dados.'}`, 'error');
        }
    });

    const deleteStudentMutation = useMutation<void, Error, string>({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students', currentPage, responsible] });
            notification('Estudante removido com sucesso!', 'success');
            if (editingStudent) { // If deleting the student being edited, clear form
                clearFormAndEditingState();
            }
        },
        onError: (error: any) => {
            notification(`Erro ao remover estudante: ${error.message || 'Erro desconhecido.'}`, 'error');
        }
    });

    const clearFormAndEditingState = () => {
        form.reset({
            name: '',
            email: '',
            responsibleId: responsible || '',
            classroomId: '',
            enrollmentFee: 0,
            monthlyFee: 0,
        });
        setEditingStudent(null);
        setApiFieldErrors({});
    };

    const onSubmit = (data: StudentFormData) => {
        setApiFieldErrors({});
        if (editingStudent) {
            updateStudentMutation.mutate({ id: editingStudent.id, studentData: data });
        } else {
            createStudentMutation.mutate(data);
        }
    };

    const handleEdit = (student: StudentResponse) => {
        setEditingStudent(student);
        form.reset({
            name: student.name,
            email: student.email || '',
            responsibleId: student.responsibleId || '',
            classroomId: student.classroomId || student.classroom || '',
            enrollmentFee: student.enrollmentFee || 0,
            monthlyFee: student.monthlyFee || student.monthyFee || 0,
        });
        setApiFieldErrors({});
    };

    const handleDelete = (id: string) => {
        deleteStudentMutation.mutate(id);
    };

    if (isLoadingClasses) return <div className="p-4">Carregando turmas...</div>;
    if (errorClasses) return <ErrorMessage message={`Erro ao carregar turmas: ${errorClasses.message}`} />;
    if (!responsible && isLoadingParents) return <div className="p-4">Carregando responsáveis...</div>;
    if (!responsible && errorParents) return <ErrorMessage message={`Erro ao carregar responsáveis: ${errorParents.message}`} />;

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold flex items-center">
                    <GraduationCap className="mr-2 h-6 w-6" />
                    Gerenciar Alunos
                </h1>
            </div>

            {errorStudents && <ErrorMessage message={`Erro ao carregar alunos: ${errorStudents.message}`} />}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {editingStudent ? 'Editar Aluno' : 'Adicionar Aluno'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ShadcnForm {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ShadcnFormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Aluno</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome do Aluno" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.name && <p className="text-sm font-medium text-destructive">{apiFieldErrors.name}</p>}
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
                                                <Input type="email" placeholder="Email do Aluno" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.email && <p className="text-sm font-medium text-destructive">{apiFieldErrors.email}</p>}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ShadcnFormField
                                    control={form.control}
                                    name="enrollmentFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taxa de Matrícula</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Valor da taxa" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} value={field.value || ''}/>
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.enrollmentFee && <p className="text-sm font-medium text-destructive">{apiFieldErrors.enrollmentFee}</p>}
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={form.control}
                                    name="monthlyFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mensalidade</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Valor da mensalidade" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                            {apiFieldErrors.monthlyFee && <p className="text-sm font-medium text-destructive">{apiFieldErrors.monthlyFee}</p>}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ShadcnFormField
                                    control={form.control}
                                    name="responsibleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Responsável</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                disabled={!!responsible || isLoadingParents}
                                                defaultValue={field.value || ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um responsável" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {!responsible && <SelectItem value=""><em>Selecione um responsável</em></SelectItem>}
                                                    {parents?.map((parent) => (
                                                        <SelectItem key={parent.id} value={parent.id}>
                                                            {parent.name}
                                                        </SelectItem>
                                                    ))}
                                                     {responsible && parents.find(p => p.id === responsible) && (
                                                        <SelectItem value={responsible} disabled>
                                                            {parents.find(p => p.id === responsible)?.name}
                                                        </SelectItem>
                                                    )}
                                                    {responsible && !parents.find(p => p.id === responsible) && (
                                                        // If responsible prop is set but not in the list (e.g. list is filtered or not loaded yet)
                                                        // We might need a way to display the name of the 'responsible' prop if available
                                                        // This case needs careful handling based on how `parents` list is populated when `responsible` prop is active
                                                        <SelectItem value={responsible} disabled>{form.getValues("responsibleId")}</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            {apiFieldErrors.responsibleId && <p className="text-sm font-medium text-destructive">{apiFieldErrors.responsibleId}</p>}
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={form.control}
                                    name="classroomId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Turma</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''} disabled={isLoadingClasses}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione uma turma" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value=""><em>Selecione uma turma</em></SelectItem>
                                                    {classes?.map((classItem) => (
                                                        <SelectItem key={classItem.id as string} value={classItem.id as string}>
                                                            {classItem.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            {apiFieldErrors.classroomId && <p className="text-sm font-medium text-destructive">{apiFieldErrors.classroomId}</p>}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex pt-4 space-x-2">
                                <Button type="submit" disabled={createStudentMutation.isPending || updateStudentMutation.isPending || isLoadingStudents}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {createStudentMutation.isPending || updateStudentMutation.isPending
                                        ? (editingStudent ? 'Atualizando...' : 'Salvando...')
                                        : (editingStudent ? 'Atualizar' : 'Salvar')
                                    }
                                </Button>
                                {editingStudent && (
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
                        Lista de Alunos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ListRegistries
                        page={studentPage || { content: [], number: 0, totalPages: 1, size: 10 }}
                        entityName={'students'}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentManager;
