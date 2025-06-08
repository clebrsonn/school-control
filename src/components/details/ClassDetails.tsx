import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClassRoomById } from '../../features/classes/services/ClassService.ts';
import { getStudentsByClassId } from '../../features/students/services/StudentService.ts'; // Assuming this service function exists or will be created
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes.ts';
import { StudentResponse, PageResponse as StudentPageResponse } from '../../features/students/types/StudentTypes.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

// Shadcn/UI Imports
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Lucide Icons
import { School, CalendarDays, Clock, Users, ArrowLeft, Info } from 'lucide-react';

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode; iconColorClass?: string }> = ({ icon: Icon, label, value, iconColorClass = "text-primary" }) => (
    <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full bg-muted`}>
            <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'Não informado'}</p>
        </div>
    </div>
);

const ClassDetails: React.FC = () => {
  const { id: classId } = useParams<{ id: string }>();

  const { data: classItem, isLoading: isLoadingClass, error: errorClass } = useQuery<ClassRoomResponse, Error>({
    queryKey: ['classroom', classId],
    queryFn: () => getClassRoomById(classId!),
    enabled: !!classId,
  });

  // Query for Students in this Class
  // Assuming getStudentsByClassId returns a PageResponse<StudentResponse> or StudentResponse[]
  // For simplicity, let's assume it returns StudentResponse[] directly or we take .content
  const { data: studentsData, isLoading: isLoadingStudents, error: errorStudents } = useQuery<StudentPageResponse<StudentResponse> | StudentResponse[], Error>({
    queryKey: ['studentsByClass', classId],
    // TODO: Ensure getStudentsByClassId exists and handles pagination if necessary, or fetches all for a class.
    // For now, assuming it fetches a list that can be handled.
    // If it's paginated, ListRegistries could be used. For a simple list, map directly.
    queryFn: () => getStudentsByClassId(classId!, { page: 0, size: 100 }), // Adjust pagination as needed
    enabled: !!classId,
  });

  const students = Array.isArray(studentsData) ? studentsData : studentsData?.content || [];


  if (isLoadingClass) return <LoadingSpinner fullScreen message="Carregando detalhes da turma..." />;
  if (errorClass) return <ErrorMessage message={`Erro ao carregar turma: ${errorClass.message}`} title="Erro"/>;
  if (!classItem) return <ErrorMessage message="Turma não encontrada." title="Não Encontrado" />;

  return (
    <div className="p-4 md:p-6 space-y-6">
        <Button variant="outline" asChild className="mb-4">
            <Link to="/classes"> {/* Assuming /classes is the route for ClassManager */}
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Turmas
            </Link>
        </Button>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                    <School className="mr-3 h-7 w-7 text-primary" />
                    Detalhes da Turma: {classItem.name}
                </CardTitle>
                {classItem.description && <CardDescription className="pt-2">{classItem.description}</CardDescription>}
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                    <DetailItem icon={School} label="Nome da Turma" value={classItem.name} iconColorClass="text-blue-600" />
                    <DetailItem icon={CalendarDays} label="Ano Letivo" value={classItem.schoolYear} iconColorClass="text-green-600" />
                    <DetailItem icon={Clock} label="Horário de Início" value={classItem.startTime || 'N/A'} iconColorClass="text-purple-600" />
                    <DetailItem icon={Clock} label="Horário de Término" value={classItem.endTime || 'N/A'} iconColorClass="text-red-600" />
                    {/* Add other relevant fields from ClassRoomResponse if any */}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-indigo-600" />
                    Alunos Matriculados
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingStudents && <LoadingSpinner />}
                {errorStudents && <ErrorMessage message={`Erro ao carregar alunos da turma: ${errorStudents.message}`} />}
                {!isLoadingStudents && !errorStudents && students.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome do Aluno</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.email || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/students/${student.id}`}>Ver Aluno</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    !isLoadingStudents && <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno matriculado nesta turma.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default ClassDetails;
