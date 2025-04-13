import React, {ChangeEvent, useEffect, useState} from 'react';
import { createClass, deleteClass, fetchClasses, updateClass } from '../../features/classes/services/ClassService';
import { Button, Container, Form } from 'react-bootstrap';
import { IClass } from '@hyteck/shared';
import notification from '../common/Notification.tsx';
import ListRegistries from '../common/ListRegistries';
import EntityTable from '../common/ListRegistries';
import {ObjectId} from "mongoose";

const ClassManager: React.FC = () => {
    const [classes, setClasses] = useState<IClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [validationErrors, setValidationErrors] = useState<{
        name: string;
        startTime: string;
        endTime: string;
        enrollmentFee: string;
        monthlyFee: string;
    }>({
        name: '',
        startTime: '',
        endTime: '',        enrollmentFee: '',
        monthlyFee: '',
    });

    const {
        validationErrors: hookValidationErrors,
        isValid,
        setFieldValue,
        validateField: validateFieldHook,
        onSubmitted,
        isSubmitted,
        clearErrors,
    } = useFormValidation<{
        name: string;
        startTime: string;
        endTime: string;
        enrollmentFee: string;
        monthlyFee: string;
    }>({
        fieldNames: ['name', 'startTime', 'endTime', 'enrollmentFee', 'monthlyFee'],
        validationErrors: validationErrors,
    });

    useEffect(() => setValidationErrors(hookValidationErrors), [hookValidationErrors]);

    useEffect(() => {
        // Fetch classes on component mount
        const getClasses = async () => {
            try {
                const classData = await fetchClasses();
                setClasses(classData);
            } catch (err) {
                setError(err.message || 'Failed to fetch classes');
            }
        };

        getClasses();
    }, []);

    const validateField = (name: string, value: string): string => {
        let errorMessage = '';
        switch (name) {
        case 'name':
            if (!value) {
                errorMessage = 'Nome é obrigatório.';
            }
            break;
        case 'startTime':
            if (!value) {
                errorMessage = 'Horário de início é obrigatório.';
            }
            break;
        case 'endTime':
            if (!value) {
                errorMessage = 'Horário de término é obrigatório.';
            }
            break;
        case 'enrollmentFee':
            if (!value) {
                errorMessage = 'Valor da matrícula é obrigatório.';
            } else if (isNaN(parseFloat(value))) {
                errorMessage = 'Valor da matrícula deve ser um número.';
            }
            break;
        case 'monthlyFee':
            if (!value) {
                errorMessage = 'Valor da mensalidade é obrigatório.';
            } else if (isNaN(parseFloat(value))) {
                errorMessage = 'Valor da mensalidade deve ser um número.';
            }
            break;
        }
        setValidationErrors(prevErrors => ({
            ...prevErrors,
            [name]: errorMessage,
        }));
        return errorMessage;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        switch (name) {
        case 'name':
            setName(value);
            break;
        case 'startTime':
            setStartTime(value);
            break;
        case 'endTime':
            setEndTime(value);
            break;
        case 'enrollmentFee':
            setEnrollmentFee(value);
            break;
        case 'monthlyFee':
            setMonthlyFee(value);
            break;
        }

        setFieldValue(name as keyof { name: string; startTime: string; endTime: string; enrollmentFee: string; monthlyFee: string }, value);
        validateFieldHook(name as keyof { name: string; startTime: string; endTime: string; enrollmentFee: string; monthlyFee: string }, value, true);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isValid()) {
            return;
        }        setError(null);
        const classData = {
            name: setFieldValue('name', ''),
            startTime: setFieldValue('startTime', ''),
            endTime: setFieldValue('endTime', ''),
            enrollmentFee: parseFloat(setFieldValue('enrollmentFee', '')),
            monthlyFee: parseFloat(setFieldValue('monthlyFee', '')),
        };

        try {
            onSubmitted();

            if (isEditing && selectedClass) {
                await updateClass({_id: selectedClass as unknown as ObjectId, ...classData});
                setClasses(classes.map(cls => (cls._id === selectedClass ? {_id: selectedClass as unknown as ObjectId, ...classData} : cls)));
                notification('Turma atualizada com sucesso!', 'success');
            } else {
                const newClass = await createClass(classData);
                setClasses([...classes, newClass]);
                notification('Classe adicionada com sucesso!', 'success');
            }

        } catch (error: any) {
            setError(error.message || (isEditing ? 'Falha ao atualizar turma' : 'Falha ao adicionar turma'));
        } finally {
            resetState();
        }
    };

    const handleEdit = (id: string) => {
        const clazz = classes.find(c => c._id === id);

        if (clazz) {
            setSelectedClass(id);
            setIsEditing(true);
            setFieldValue('name', clazz.name);
            setFieldValue('startTime', clazz.startTime);
            setFieldValue('endTime', clazz.endTime);
            setFieldValue('enrollmentFee', clazz.enrollmentFee.toString());
            setFieldValue('monthlyFee', clazz.monthlyFee.toString());
        }
    };

    const resetState = () => {
        setFieldValue('name', '');
        setFieldValue('startTime', '');
        setFieldValue('endTime', '');
        setFieldValue('enrollmentFee', '');
        setFieldValue('monthlyFee', '');
        setValidationErrors({ name: '', startTime: '', endTime: '', enrollmentFee: '', monthlyFee: '' });
        setSelectedClass(null);
        setIsEditing(false);
        clearErrors();
    };

    const renderClassActions = (clazz: IClass) => (
        <>
            <Button variant="outline-primary" size="sm" onClick={() => handleEdit(clazz._id)}>Editar</Button>
            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(clazz._id)}>Excluir</Button>
        </>
    );

    const handleDelete = async (id: string) => {
        try {
            await deleteClass(id as unknown as ObjectId);
            setClasses(classes.filter(clazz => clazz._id !== id));
            notification('Turma removida com sucesso!', 'success');
        } catch (error: any) {
            setError(error.message || 'Erro ao remover turma.');
        }
    };

    const handleAdd = () => {
        handleSubmit(new Event('submit') as React.FormEvent);
    }

    return (
        <Container>
            <h1>Gerenciar Turmas</h1>
            {error && <div className="alert alert-danger">{ error }</div>}
            <Form>
                <Form.Group controlId="formClassName">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome da Turma"
                        name="name"
                        value={setFieldValue('name', '')}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.name}
                    />
                    {validationErrors.name && (
                        <Form.Control.Feedback type="invalid">{ validationErrors.name }</Form.Control.Feedback>)}
                </Form.Group>
                <Form.Group controlId="formClassStartTime">
                    <Form.Label>Horário de início</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Horário de Início"
                        name="startTime"
                        value={setFieldValue('startTime', '')}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.startTime}
                    />
                    {validationErrors.startTime && (
                        <Form.Control.Feedback type="invalid">{ validationErrors.startTime }</Form.Control.Feedback>)}
                </Form.Group>
                <Form.Group controlId="formClassEndTime">
                    <Form.Label>Horário de término</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Horário de Término"
                        name="endTime"
                        value={setFieldValue('endTime', '')}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.endTime}
                    />
                    {validationErrors.endTime && (
                        <Form.Control.Feedback type="invalid">{ validationErrors.endTime }</Form.Control.Feedback>)}
                </Form.Group>
                <Form.Group controlId="formClassEnrollmentFee">
                    <Form.Label>Matrícula</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enrollment Fee"
                        name="enrollmentFee"
                        value={setFieldValue('enrollmentFee', '')}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.enrollmentFee}
                    />
                    {validationErrors.enrollmentFee && (
                        <Form.Control.Feedback type="invalid">{ validationErrors.enrollmentFee }</Form.Control.Feedback>)}
                </Form.Group>
                <Form.Group controlId="formClassMonthlyFee">
                    <Form.Label>Mensalidade</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Monthly Fee"
                        name="monthlyFee"
                        value={setFieldValue('monthlyFee', '')}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.monthlyFee}
                    />
                    {validationErrors.monthlyFee && (
                        <Form.Control.Feedback type="invalid">{ validationErrors.monthlyFee }</Form.Control.Feedback>)}
                </Form.Group>
                <Button onClick={handleAdd} className="mt-3" disabled={isSubmitted || !isValid()}>
                    { isEditing ? 'Atualizar Turma' : 'Adicionar Turma' }
                </Button>
                {isEditing && (
                    <Button variant="secondary" onClick={resetState} className="mt-3 ms-2">Cancelar</Button>
                )}
            </Form>

            <h3 className="mt-4">Lista de Turmas</h3>
            <ListRegistries data={classes} entityName="classe" renderActions={renderClassActions} onSelect={setSelectedClass} />

        </Container>
    );
};

export default ClassManager;