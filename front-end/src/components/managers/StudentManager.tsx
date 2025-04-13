import React, { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { IClass, IStudent, IResponsible, IEnrollment } from '@hyteck/shared';
import notification from '../common/Notification.tsx';
import mongoose from 'mongoose';
import { createStudent,
    fetchStudents,
    fetchStudentsByParentId,
    enrollStudent as enrollStudentService
} from '../../features/students/services/StudentService.ts';
import EntityTable from '../common/ListRegistries';
import { fetchClasses } from '../../features/classes/services/ClassService.ts';
import { fetchParents } from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import useFormValidation from '../../hooks/useFormValidation';

interface StudentManagerProps {
    responsible: string | undefined;
}

const StudentManager: React.FC<StudentManagerProps> = ({ responsible }) => {
    const [students, setStudents] = useState<IStudent[]>([]); // Local state for students
    const [classes, setClasses] = useState<IClass[]>([]); // Local state for classes
    const [parents, setParents] = useState<IResponsible[]>([]); // Local state for parents
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    // Use the useFormValidation hook for form validation and state management
    const {
        validateField,
        isValid,
        updateField,
        validationErrors,
        isSubmitted,
        onSubmitted,
        clearErrors,
    } = useFormValidation({
        fieldNames: ['name', 'classId', 'responsible', 'enrollmentFee', 'monthlyFee'],
        validationErrors: {
            name: '',
            classId: '',
            responsible: '',
            enrollmentFee: '',
            monthlyFee: '',
        },
        onSubmitted: async () => {
            if (isSubmitted) {
                try {
                    await handleAddStudent();
                    clearErrors();
                } catch (err: any) {
                    notification(err.message || 'Failed to add student', 'error');
                }
            }
        },
        initialValues: {
            responsible: responsible || '',
            enrollmentFee: '0',
        },
    });

    useEffect(() => {
        const getStudents = async () => {
            try {
                let students: IStudent[] = [];
                if (responsible) {
                    students = await fetchStudentsByParentId(responsible);
                } else {
                    students = await fetchStudents();
                }
                setStudents(students);
            } catch (err: any) {
                notification(err.message || 'Failed to fetch students', 'error');
            }
        };

        const getClasses = async () => { // Function to fetch classes
            try {
                const classData = await fetchClasses();
                setClasses(classData);
            } catch (err: any) {
                notification(err.message || 'Failed to fetch classes', 'error');
            }
        };

        const getParents = async () => { // Function to fetch parents
            try {
                const parentData = await fetchParents();
                setParents(parentData);
            } catch (err: any) {
                notification(err.message || 'Failed to fetch parents', 'error');
            }
        };

        getStudents();
        getClasses();
        if (!responsible) {
            getParents();
        }

        if(selectedStudent) {
            const getStudent = async () => {
                students.find(student => student._id === selectedStudent);
            }
            getStudent();
        }

    }, [responsible, setStudents, selectedStudent]);

    const handleAddStudent = async () => {
        if (!isValid() || !isSubmitted) {
            return;
        }
        const newStudent: Omit<IStudent, '_id'> = {
            name: updateField('name', ""),
            responsible: responsible || updateField('responsible', ''),
        };
        const createdStudent = await createStudent(newStudent);
        setStudents(prevStudents => [...prevStudents, createdStudent]);
        notification('Aluno adicionado com sucesso', 'success');
        clearErrors();
        // Reset form fields after successful submission
        updateField('name', '');
        updateField('responsible', '');
    };

    const handleEnroll = async () => {
        try {
            if (!isValid() || !selectedStudent) {
                throw new Error("Student or form is invalid");
            }

            const classId = updateField('classId', '');
            const enrollmentFee = updateField('enrollmentFee', 0);
            const monthlyFee = updateField('monthlyFee', 0);
            console.log({classId, enrollmentFee, monthlyFee})

            const newEnrollment:  Partial<IEnrollment> & {enrollmentFee: number, monthlyFee: number} = {
                classId: classId,
                enrollmentFee: enrollmentFee,
                monthlyFee: monthlyFee,
            }
            await enrollStudentService(selectedStudent, newEnrollment)
            notification('Aluno matriculado com sucesso', 'success');
            clearErrors();
            // Reset form fields after successful enrollment
            updateField('classId', '');
            updateField('enrollmentFee', '0');
            updateField('monthlyFee', '');
        } catch (err: any) {
            notification(err.message || 'Failed to enroll student', 'error');
        } 
    };

    const handleDelete = async (id: string) => {
        try {
            // await deleteStudent(id);
            // setStudents(prevStudents => prevStudents.filter(student => student._id !== id));
            // notification('Estudante removido com sucesso.', 'success');
            alert("Not implemented yet")
        } catch (err: any) {
            setError(err.message || 'Failed to remove student.');
        }
    };

    return (
        <Container>
            <h1>Gerenciar Alunos</h1>
            <Form>
                <Form.Group controlId="formStudentName">
                    <Form.Label>Nome do Aluno</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome do Aluno"
                        value={updateField('name', '')}
                        onChange={e => updateField('name', e.target.value)}
                        onBlur={e => validateField('name', e.target.value, true)}
                        isInvalid={!!validationErrors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.name}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formStudentClass">
                    <Form.Label>Turma</Form.Label>
                    <Form.Control
                        as="select"
                        value={updateField('classId', '')}
                        onChange={e => updateField('classId', e.target.value)}
                        onBlur={e => validateField('classId', e.target.value, true)}
                        isInvalid={!!validationErrors.classId}
                    >
                        <option value="">Selecione uma turma</option>
                        {classes.map((classItem) => (
                            <option key={classItem._id as string} value={classItem._id as string}>
                            {classItem.name}
                            </option>
                        ))}
                    </Form.Control>
                    {validationErrors.classId && (
                        <Form.Text className="text-danger">{validationErrors.classId}</Form.Text>
                        )}
                </Form.Group>
                {!responsible &&  (
                    <Form.Group controlId="formParent">
                        <Form.Label>Responsável</Form.Label>
                        <Form.Control
                            as="select"
                            value={responsible}
                            onChange={(e) => responsible = (e.target.value)}
                            onBlur={e => validateField('responsible', e.target.value, true)}>
                            {parents.map((parent) => (
                                <option key={parent._id} value={parent._id}>
                                    {parent.name}
                                </option>
                            ))}
                        </Form.Control>
                        {validationErrors.responsible && (
                            <Form.Text className="text-danger">{validationErrors.responsible}</Form.Text>
                        )}
                    </Form.Group>
                
                )}

                <Form.Group controlId="formEnrollmentFee">
                    <Form.Label>Taxa de Matrícula</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Taxa de Matrícula"
                        value={updateField('enrollmentFee', 0)}
                        onChange={e => updateField('enrollmentFee', Number(e.target.value))}
                        onBlur={e => validateField('enrollmentFee', Number(e.target.value), true)}
                        isInvalid={!!validationErrors.enrollmentFee}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.enrollmentFee}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formMonthlyFee">
                    <Form.Label>Mensalidade</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Mensalidade"
                        value={updateField('monthlyFee', 0)}
                        onChange={e => updateField('monthlyFee', Number(e.target.value))}
                        onBlur={e => validateField('monthlyFee', Number(e.target.value), true)}
                        isInvalid={!!validationErrors.monthlyFee}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.monthlyFee}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-between">
                    <Button variant="primary" onClick={() => onSubmitted?.()} disabled={!isValid()}>
                        Save Student
                    </Button>
                    <Button variant="success" onClick={handleEnroll} disabled={!isValid() || !selectedStudent}>
                        Enroll Student
                    </Button>
                </div>
            
            </Form>

            {students.length > 0 && (
                <>
                    <h2>Students</h2>
                    <EntityTable
                        data={students}
                        entityName={'student'}
                        onDelete={handleDelete}
                        onSelect={(id: string) => setSelectedStudent(id)}
                    />
                    {selectedStudent && (
                        <p>Selected Student ID: {selectedStudent}</p>
                    )}
                </>
            )}
        </Container>
    );
};

export default StudentManager;