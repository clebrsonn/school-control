import React, { useEffect, useState } from 'react';
import { createParent, deleteParent, fetchParents } from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import notification from '../common/Notification.tsx';
import { Button, Form } from 'react-bootstrap';
import { IResponsible } from '@hyteck/shared';
import EntityTable from '../common/ListRegistries.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import useFormValidation from '../../hooks/useFormValidation';

const ParentManager: React.FC = () => {
    const [parents, setParents] = useState<IResponsible[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const {
        validateField,
        isValid,
        setFieldValue,
        validationErrors,
        onSubmitted,
        clearErrors
    } = useFormValidation<Partial<IResponsible>>({
        fieldNames: ['name', 'phone'],
    });

    useEffect(() => {
        if(isSubmitted)
            clearErrors();
    }, [isSubmitted])

    useEffect(() => {
        const getParents = async () => {
            try {
                setLoading(true);
                const fetchedParents = await fetchParents();
                setParents(fetchedParents);
                setLoading(false);
            } catch (err: unknown) {
                handleApiError(err, 'Failed to fetch parents');
                setLoading(false);
            }
        };
        getParents();
    }, [setParents, setLoading]);

    if (loading) {
        return <LoadingSpinner />;
    }

    const handleApiError = (err: unknown, defaultMessage: string) => {
        setError((err as Error).message || defaultMessage);
        console.error(err);
    };

    const handleAddParent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitted(true);
            onSubmitted();

            if (!isValid()) return;

            const newParent: Partial<IResponsible> = {
                name: setFieldValue('name', ''),
                phone: setFieldValue('phone', ''),
                students: []
            };
            const createdParent = await createParent(newParent as IResponsible) as IResponsible;
            setParents(prev => [...prev, createdParent]);
            setError(null);
            notification('Parent added successfully', 'success');
        } catch (err: unknown) {
            handleApiError(err, 'Failed to add parent');
        }
    };

    const resetForm = () => {
        ['name', 'phone'].forEach(fieldName => setFieldValue(fieldName as keyof Partial<IResponsible>, ''));
    }
    const handleDelete = async (id: string) => {
        try {
            await deleteParent(id);
            setParents(prevParents => prevParents.filter(parent => parent._id !== id));
            notification('Parent removed successfully', 'success');
        } catch (err: unknown) {
            handleApiError(err, 'Failed to remove parent.');
        }
    };
    if (!parents) return <LoadingSpinner />;
    return (<>
        <div>
            <h1>Manage Parents</h1>
            {error && <ErrorMessage message={error} />}
            <Form>
                <Form.Group controlId="formParentName">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Name"
                        value={setFieldValue('name', '')}
                        onChange={e => setFieldValue('name', e.target.value)}
                        onBlur={e => validateField('name', e.target.value, true)}
                        isInvalid={!!validationErrors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.name}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formParentPhone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Phone"
                        value={setFieldValue('phone', '')}
                        onChange={e => setFieldValue('phone', e.target.value)}
                        onBlur={e => validateField('phone', e.target.value, true)}
                        isInvalid={!!validationErrors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.phone}
                    </Form.Control.Feedback>
                </Form.Group>
                <Button
                    variant="primary"
                    onClick={handleAddParent}
                    className="mt-3"
                    disabled={!isValid()}
                >
                    Save
                </Button>
            </Form>
        </div>
        <h2>Parents</h2>
            <EntityTable data={parents} entityName="parent" onDelete={handleDelete}/>
            </>
    );
};
export default ParentManager;