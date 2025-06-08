import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

import { getStudentById } from '../../features/students/services/StudentService.ts';
import { StudentResponse } from '../../features/students/types/StudentTypes.ts';
import { getAllClassRooms } from '../../features/classes/services/ClassService.ts';
import { ClassRoomResponse, PageResponse as ClassPageResponse } from '../../features/classes/types/ClassRoomTypes.ts';
import {
    enrollStudent,
    cancelEnrollment,
    renewEnrollment,
    getStudentEnrollments
} from '../../features/enrollments/services/EnrollmentService.ts';
import { EnrollmentRequest, EnrollmentResponse } from '../../features/enrollments/types/EnrollmentTypes.ts';
import { enrollmentSchema, EnrollmentFormData, enrollmentApiRequestSchema } from '@/features/enrollments/types/enrollmentSchemas.ts';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form as ShadcnForm, FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";


// Lucide Icons
import { User, Users, CalendarDays, CheckCircle, XCircle, Redo, Edit, PlusCircle, GraduationCap as StudentIcon, BookOpen, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';


const StudentDetails: React.FC = () => {
    const { id: studentId } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [isEnrollmentFormOpen, setIsEnrollmentFormOpen] = useState(false);
    const [currentEnrollmentAction, setCurrentEnrollmentAction] = useState<'enroll' | 'change'>('enroll');

    // --- Data Fetching ---
    const { data: student, isLoading: isLoadingStudent, error: errorStudent } = useQuery<StudentResponse, Error>({
        queryKey: ['student', studentId],
        queryFn: () => getStudentById(studentId!),
        enabled: !!studentId,
    });

    const { data: classroomsData, isLoading: isLoadingClassrooms, error: errorClassrooms } = useQuery<ClassPageResponse<ClassRoomResponse>, Error>({
        queryKey: ['allClassroomsForSelect'],
        queryFn: () => getAllClassRooms({ page: 0, size: 200 }), // Fetch a good number for select
    });
    const classrooms = classroomsData?.content || [];

    const { data: enrollments = [], isLoading: isLoadingEnrollments, error: errorEnrollments, refetch: refetchEnrollments } = useQuery<EnrollmentResponse[], Error>({
        queryKey: ['studentEnrollments', studentId],
        queryFn: () => getStudentEnrollments(studentId!),
        enabled: !!studentId,
    });

    // --- Mutations ---
    const enrollStudentMutation = useMutation<EnrollmentResponse, Error, EnrollmentRequest>({
        mutationFn: enrollStudent,
        onSuccess: () => {
            notification('Matrícula realizada com sucesso!', 'success');
            refetchEnrollments();
            queryClient.invalidateQueries({queryKey: ['student', studentId]}); // Student might have updated class info
            setIsEnrollmentFormOpen(false);
        },
        onError: (err: Error) => notification(`Erro ao matricular: ${err.message}`, 'error'),
    });

    const cancelEnrollmentMutation = useMutation<void, Error, string>({
        mutationFn: cancelEnrollment,
        onSuccess: () => {
            notification('Matrícula cancelada com sucesso!', 'success');
            refetchEnrollments();
            queryClient.invalidateQueries({queryKey: ['student', studentId]});
        },
        onError: (err: Error) => notification(`Erro ao cancelar matrícula: ${err.message}`, 'error'),
    });

    const renewEnrollmentMutation = useMutation<EnrollmentResponse, Error, string>({
        mutationFn: renewEnrollment,
        onSuccess: () => {
            notification('Matrícula renovada com sucesso!', 'success');
            refetchEnrollments();
             queryClient.invalidateQueries({queryKey: ['student', studentId]});
        },
        onError: (err: Error) => notification(`Erro ao renovar matrícula: ${err.message}`, 'error'),
    });

    // --- Enrollment Form ---
    const enrollmentForm = useForm<EnrollmentFormData>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: { classRoomId: '', enrollmentFee: 0, monthlyFee: 0 },
    });

    const handleEnrollmentSubmit = (data: EnrollmentFormData) => {
        if (!studentId) return;
        const apiData = enrollmentApiRequestSchema.parse(data); // Transform data for API
        const requestData: EnrollmentRequest = {
            studentId: studentId,
            classRoomId: apiData.classRoomId,
            enrollmentFee: apiData.enrollmentFee,
            monthyFee: apiData.monthyFee, // Ensure this matches service expectation
        };
        enrollStudentMutation.mutate(requestData);
    };

    const openEnrollmentModal = (action: 'enroll' | 'change', enrollment?: EnrollmentResponse) => {
        setCurrentEnrollmentAction(action);
        enrollmentForm.reset({
            classRoomId: action === 'change' && enrollment ? enrollment.classRoomId : '',
            enrollmentFee: action === 'change' && enrollment ? enrollment.enrollmentFee : 0,
            monthlyFee: action === 'change' && enrollment ? enrollment.monthlyFee : 0, // watch for monthyFee typo
        });
        setIsEnrollmentFormOpen(true);
    };


    // --- Render Logic ---
    if (isLoadingStudent) return <LoadingSpinner fullScreen message="Carregando dados do aluno..." />;
    if (errorStudent) return <ErrorMessage message={errorStudent.message} title="Erro ao carregar aluno" />;
    if (!student) return <ErrorMessage message="Aluno não encontrado." />;

    const currentEnrollment = enrollments.find(e => e.status === 'ACTIVE' || (e.endDate && new Date(e.endDate) > new Date()));
    const canRenew = currentEnrollment && currentEnrollment.endDate && new Date(currentEnrollment.endDate) <= new Date();
    const canCancel = currentEnrollment && (!currentEnrollment.endDate || new Date(currentEnrollment.endDate) > new Date());


    return (
        <TooltipProvider>
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-semibold flex items-center">
                        <StudentIcon className="mr-3 h-8 w-8 text-primary" />
                        Detalhes do Aluno
                    </h1>
                    {/* Maybe an edit student button here if that's a feature */}
                </div>

                <Card>
                    <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <StudentIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Nome</p>
                                <p className="font-medium">{student.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Responsável</p>
                                <p className="font-medium">
                                    <Link to={`/parents/${student.responsibleId}`} className="text-primary hover:underline">
                                        {student.responsibleName}
                                    </Link>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                             <BookOpen className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Turma Atual</p>
                                <p className="font-medium">{student.className || 'Não matriculado'}</p>
                            </div>
                        </div>
                         <div className="flex items-center space-x-3">
                             <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Mensalidade</p>
                                <p className="font-medium">{student.monthlyFee ? `R$ ${student.monthlyFee.toFixed(2)}` : 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center">
                            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                            Matrícula
                        </CardTitle>
                        {!currentEnrollment && (
                             <Button size="sm" onClick={() => openEnrollmentModal('enroll')}>
                                <PlusCircle className="mr-2 h-4 w-4"/>Matricular Aluno
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoadingEnrollments && <LoadingSpinner />}
                        {errorEnrollments && <ErrorMessage message={errorEnrollments.message} title="Erro ao carregar matrículas"/>}
                        {!isLoadingEnrollments && !errorEnrollments && (
                            currentEnrollment ? (
                                <div className="space-y-3">
                                    <p><strong>Turma:</strong> {currentEnrollment.classRoomName}</p>
                                    <p><strong>Data da Matrícula:</strong> {new Date(currentEnrollment.enrollmentDate).toLocaleDateString()}</p>
                                    <p><strong>Data de Término:</strong> {currentEnrollment.endDate ? new Date(currentEnrollment.endDate).toLocaleDateString() : 'Não definida (contínua)'}</p>
                                    <p><strong>Status:</strong> <Badge variant={currentEnrollment.status === 'ACTIVE' ? 'success' : 'secondary'}>{currentEnrollment.status}</Badge></p>
                                    <div className="flex space-x-2 pt-2">
                                        {canCancel && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="destructive" size="sm" onClick={() => cancelEnrollmentMutation.mutate(currentEnrollment.id!)} disabled={cancelEnrollmentMutation.isPending}>
                                                        <XCircle className="mr-1 h-4 w-4" /> Cancelar
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Cancelar matrícula atual</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {canRenew && (
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="default" size="sm" onClick={() => renewEnrollmentMutation.mutate(currentEnrollment.id!)} disabled={renewEnrollmentMutation.isPending}>
                                                        <Redo className="mr-1 h-4 w-4" /> Renovar
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Renovar matrícula para o próximo período</TooltipContent>
                                            </Tooltip>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => openEnrollmentModal('change', currentEnrollment)}>
                                                    <Edit className="mr-1 h-4 w-4" /> Alterar Turma
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Mudar aluno de turma (nova matrícula será criada)</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">Este aluno não está matriculado em nenhuma turma.</p>
                            )
                        )}
                    </CardContent>
                </Card>

                {/* Enrollment Form Dialog */}
                <Dialog open={isEnrollmentFormOpen} onOpenChange={setIsEnrollmentFormOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{currentEnrollmentAction === 'change' ? 'Alterar Turma' : 'Nova Matrícula'}</DialogTitle>
                        </DialogHeader>
                        <ShadcnForm {...enrollmentForm}>
                            <form onSubmit={enrollmentForm.handleSubmit(handleEnrollmentSubmit)} className="space-y-4">
                                <ShadcnFormField
                                    control={enrollmentForm.control}
                                    name="classRoomId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Turma</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoadingClassrooms}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione uma turma" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classrooms.map(cls => <SelectItem key={cls.id} value={cls.id!}>{cls.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={enrollmentForm.control}
                                    name="enrollmentFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taxa de Matrícula (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <ShadcnFormField
                                    control={enrollmentForm.control}
                                    name="monthlyFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mensalidade (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsEnrollmentFormOpen(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={enrollStudentMutation.isPending}>
                                        {enrollStudentMutation.isPending ? 'Salvando...' : 'Salvar Matrícula'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </ShadcnForm>
                    </DialogContent>
                </Dialog>

                 {/* Placeholder for future sections like Payments History for this student */}
                 <Card>
                    <CardHeader><CardTitle>Histórico de Pagamentos (Aluno)</CardTitle></CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">Em breve: Lista de pagamentos específicos deste aluno.</p>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
};

export default StudentDetails;
