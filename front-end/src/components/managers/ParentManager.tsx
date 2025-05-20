import React, { useEffect, useState, useMemo } from 'react';
import { createParent, deleteParent, fetchParents } from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import notification from '../common/Notification.tsx';
import { Button, Form } from 'react-bootstrap';
import { IResponsible } from '@hyteck/shared';
import ListRegistries from '../common/ListRegistries.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import EditParentModal from '../modals/EditParentModal'; // Added import

// Constants for reusable initial states
const INITIAL_PARENT_STATE: Partial<IResponsible> = { name: '', phone: '' };

const ParentManager: React.FC = () => {
    const [parents, setParents] = useState<IResponsible[]>([]);
    const [formState, setFormState] = useState(INITIAL_PARENT_STATE);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false); // Added state for modal visibility
    const [editingParent, setEditingParent] = useState<IResponsible | null>(null); // Added state for parent being edited
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);


    const handleParentUpdated = (updatedParent: IResponsible) => { // Implemented callback
        setParents(prevParents =>
            prevParents.map(p => (p._id === updatedParent._id ? updatedParent : p))
        );
        setShowEditModal(false);
        setEditingParent(null);
    };

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

    const handleEditParent = (id: string) => {
        const parentToEdit = parents.find(p => p._id === id);
        if (parentToEdit) {
            setEditingParent(parentToEdit);
            setShowEditModal(true);
            // notification(`Editing parent: ${parentToEdit.name} (Modal not implemented yet)`, 'info'); // Removed placeholder notification
        }
    };

    const filteredParents = useMemo(() => {
        if (!searchTerm) {
            return parents;
        }
        return parents.filter(parent =>
            parent.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [parents, searchTerm]);

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
            <Form.Group controlId="formParentSearch">
                <Form.Label>Buscar Responsável</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Digite o nome para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-3"
                />
            </Form.Group>
            <ListRegistries data={filteredParents} entityName="parent" onDelete={handleDelete} onEdit={handleEditParent} /> {/* Added onEdit prop */}

            {/* Replaced Placeholder with EditParentModal */}
            {editingParent && ( // Ensure editingParent is not null before rendering modal
                 <EditParentModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingParent(null); // Also clear editingParent on manual close
                    }}
                    parent={editingParent}
                    onParentUpdated={handleParentUpdated}
                />
            )}
        </div>
    );
};

export default ParentManager;