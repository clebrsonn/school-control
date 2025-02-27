import React, {useEffect, useState} from 'react';
import {createParent, deleteParent, fetchParents} from '../../services/ParentService';
import ErrorMessage from '../ErrorMessage';
import notification from '../Notification';
import {Button, Form} from 'react-bootstrap';
import {IResponsible} from '@hyteck/shared';
import ListRegistries from '../pieces/ListRegistries.tsx';
import {LoadingSpinner} from '../LoadingSpinner.tsx';

// Constants for reusable initial states
const INITIAL_PARENT_STATE = { name: '', phone: '' };

const ParentManager: React.FC = () => {
    const [parents, setParents] = useState<IResponsible[]>([]);
    const [formState, setFormState] = useState(INITIAL_PARENT_STATE);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);


    // Fetch parents when the component is mounted
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
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }


    // Centralized error handler for API calls
    const handleApiError = (err: unknown, defaultMessage: string) => {
        setError((err as Error).message || defaultMessage);
        console.error(err);
    };

    // Updates the form state dynamically
    const updateFormState = (field: keyof typeof formState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    // Handles adding a new parent
    const handleAddParent = async () => {
        try {
            const newParent = { ...formState, students: [] };
            const addedParent = await createParent(newParent);
            setParents((prev) => [...prev, addedParent]);
            setFormState(INITIAL_PARENT_STATE);
            setError(null);
            notification('Parent added successfully', 'success');
        } catch (err: unknown) {
            handleApiError(err, 'Failed to add parent');
        }
    };

    // Handles deleting a parent
    const handleDelete = async (id: string) => {
        try {
            await deleteParent(id);
            setParents((prev) => prev.filter((parent) => parent._id !== id));
            notification('Responsável removido com sucesso.', 'success');
        } catch (err: unknown) {
            handleApiError(err, 'Erro ao remover o responsável.');
        }
    };

    if (!parents) return <LoadingSpinner />;

    return (
        <div>
            <h1>Gerenciar Responsáveis</h1>
            {error && <ErrorMessage message={error} />}
            <Form>
                <Form.Group controlId="formParentName">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Name"
                        value={formState.name}
                        onChange={(e) => updateFormState('name', e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formParentPhone">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Phone"
                        value={formState.phone}
                        onChange={(e) => updateFormState('phone', e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleAddParent} className="mt-3">
                    Save
                </Button>
            </Form>
            <h2>Responsáveis</h2>
            <ListRegistries data={parents} entityName="parent" onDelete={handleDelete} />
        </div>
    );
};

export default ParentManager;