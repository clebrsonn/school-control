import React, { useEffect, useState } from 'react';
import { createParent, fetchParents, deleteParent } from '@services/ParentService';
import ErrorMessage from '@components/ErrorMessage';
import notification from '@components/Notification';
import { Button, Form } from 'react-bootstrap';
import { IResponsible } from '@hyteck/shared';
import ListRegistries from '../pieces/ListRegistries.tsx';

// Constants for reusable initial states
const INITIAL_PARENT_STATE = { name: '', email: 'N/A', phone: '' };

const ParentManager: React.FC = () => {
    const [parents, setParents] = useState<IResponsible[]>([]);
    const [formState, setFormState] = useState(INITIAL_PARENT_STATE);
    const [error, setError] = useState<string | null>(null);

    // Fetch parents when the component is mounted
    useEffect(() => {
        const getParents = async () => {
            try {
                const fetchedParents = await fetchParents();
                setParents(fetchedParents);
            } catch (err: any) {
                handleApiError(err, 'Failed to fetch parents');
            }
        };
        getParents();
    }, []);

    // Centralized error handler for API calls
    const handleApiError = (err: any, defaultMessage: string) => {
        setError(err.message || defaultMessage);
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
        } catch (err: any) {
            handleApiError(err, 'Failed to add parent');
        }
    };

    // Handles deleting a parent
    const handleDelete = async (id: string) => {
        try {
            await deleteParent(id);
            setParents((prev) => prev.filter((parent) => parent._id !== id));
            notification('Responsável removido com sucesso.', 'success');
        } catch (err: any) {
            handleApiError(err, 'Erro ao remover o responsável.');
        }
    };

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