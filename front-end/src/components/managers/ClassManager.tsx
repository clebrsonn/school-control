import React, { useEffect, useState, useMemo } from 'react';
import { createClass, deleteClass, fetchClasses } from '../../features/classes/services/ClassService';
import { Button, Container, Form } from 'react-bootstrap';
import { IClass } from '@hyteck/shared';
import notification from '../common/Notification.tsx';
import ListRegistries from '../common/ListRegistries.tsx';
import EditClassModal from '../modals/EditClassModal'; // Added import

const ClassManager: React.FC = () => {
    const [classes, setClasses] = useState<IClass[]>([]);
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [enrollmentFee, setEnrollmentFee] = useState('');
    const [monthlyFee, setMonthlyFee] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClass, setEditingClass] = useState<IClass | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClassUpdated = (updatedClass: IClass) => { // Implemented callback
        setClasses(prevClasses =>
            prevClasses.map(c => (c._id === updatedClass._id ? updatedClass : c))
        );
        setShowEditModal(false);
        setEditingClass(null);
    };

    useEffect(() => {
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

    const handleAddClass = async () => {
        try {
            const newClass = {
                name,
                startTime,
                endTime,
                enrollmentFee: parseFloat(enrollmentFee),
                monthlyFee: parseFloat(monthlyFee)
            };
            const addedClass = await createClass(newClass);
            setClasses([...classes, addedClass]);
            setName('');
            setStartTime('');
            setEndTime('');
            setEnrollmentFee('');
            setMonthlyFee('');
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to add class');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteClass(id);
            setClasses(classes.filter((clazz) => clazz._id !== id));
            notification('Turma removida com sucesso.');
        } catch {
            setError('Erro ao remover a turma.');
        }
    };

    const handleEditClass = (id: string) => {
        const classToEdit = classes.find(c => c._id === id);
        if (classToEdit) {
            setEditingClass(classToEdit);
            setShowEditModal(true);
            // notification(`Editing class: ${classToEdit.name}`, 'info'); // Removed placeholder notification
        }
    };

    const filteredClasses = useMemo(() => {
        if (!searchTerm) {
            return classes;
        }
        return classes.filter(cls =>
            cls.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [classes, searchTerm]);

    return (
        <Container>
            <h1>Classes</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form>
                <Form.Group controlId="formClassName">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Class Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassStartTime">
                    <Form.Label>Horário de início</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Start Time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassEndTime">
                    <Form.Label>Horário de término</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="End Time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassEnrollmentFee">
                    <Form.Label>Matrícula</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enrollment Fee"
                        value={enrollmentFee}
                        onChange={(e) => setEnrollmentFee(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formClassMonthlyFee">
                    <Form.Label>Mensalidade</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Monthly Fee"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                    />
                </Form.Group>
                <Button onClick={handleAddClass} className="mt-3">Add Class</Button>
            </Form>
            <h3 className="mt-4">Lista de Turmas</h3>
            <Form.Group controlId="formClassSearch">
                <Form.Label>Buscar Turma</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Digite o nome da turma para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-3"
                />
            </Form.Group>
            <ListRegistries data={filteredClasses} entityName={'classe'} onDelete={handleDelete} onEdit={handleEditClass} />

            {editingClass && (
                <EditClassModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingClass(null);
                    }}
                    classToEdit={editingClass}
                    onClassUpdated={handleClassUpdated}
                />
            )}
        </Container>
    );
};

export default ClassManager;