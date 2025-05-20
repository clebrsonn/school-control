import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { IStudent, IClass, IResponsible } from '@hyteck/shared';
import { updateStudent } from '../../features/students/services/StudentService';
import { fetchClasses } from '../../features/classes/services/ClassService';
import { fetchParents } from '../../features/parents/services/ParentService';
import notification from '../common/Notification';

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: IStudent | null;
    onStudentUpdated: (updatedStudent: IStudent) => void;
}

// Assuming Modal.setAppElement is called globally, e.g., in main.tsx or App.tsx
// Modal.setAppElement('#root');

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student, onStudentUpdated }) => {
    const [name, setName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedResponsibleId, setSelectedResponsibleId] = useState('');

    const [classesList, setClassesList] = useState<IClass[]>([]);
    const [parentsList, setParentsList] = useState<IResponsible[]>([]);

    const [isLoadingData, setIsLoadingData] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (student) {
            setName(student.name || '');
            // Ensure classId and responsible are correctly accessed, they might be objects or just IDs
            setSelectedClassId(typeof student.classId === 'string' ? student.classId : (student.classId as IClass)?._id || '');
            setSelectedResponsibleId(typeof student.responsible === 'string' ? student.responsible : (student.responsible as IResponsible)?._id || '');
        } else {
            setName('');
            setSelectedClassId('');
            setSelectedResponsibleId('');
        }
    }, [student]);

    useEffect(() => {
        if (isOpen && (classesList.length === 0 || parentsList.length === 0)) {
            setIsLoadingData(true);
            setFetchError(null);
            Promise.all([fetchClasses(), fetchParents()])
                .then(([fetchedClasses, fetchedParents]) => {
                    setClassesList(fetchedClasses);
                    setParentsList(fetchedParents);
                })
                .catch(error => {
                    console.error("Failed to fetch classes or parents:", error);
                    setFetchError("Erro ao carregar dados para os campos de seleção. Tente novamente.");
                    notification("Erro ao carregar dados para os campos de seleção.", "error");
                })
                .finally(() => {
                    setIsLoadingData(false);
                });
        }
    }, [isOpen, classesList.length, parentsList.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student?._id) {
            notification('Erro: ID do aluno não encontrado.', 'error');
            return;
        }

        const updatedData: Partial<IStudent> = {};
        if (name !== student.name) updatedData.name = name;
        if (selectedClassId !== (typeof student.classId === 'string' ? student.classId : (student.classId as IClass)?._id)) {
            updatedData.classId = selectedClassId;
        }
        if (selectedResponsibleId !== (typeof student.responsible === 'string' ? student.responsible : (student.responsible as IResponsible)?._id)) {
            updatedData.responsible = selectedResponsibleId;
        }
        
        if (Object.keys(updatedData).length === 0) {
            notification('Nenhuma alteração detectada.', 'info');
            onClose();
            return;
        }

        try {
            const updatedStudentResponse = await updateStudent(student._id, updatedData);
            onStudentUpdated(updatedStudentResponse);
            notification('Aluno atualizado com sucesso!', 'success');
            onClose();
        } catch (error) {
            console.error("Failed to update student:", error);
            notification(`Erro ao atualizar aluno: ${(error as Error).message || 'Erro desconhecido'}`, 'error');
        }
    };

    const customModalStyles = {
        content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            minWidth: '300px', maxWidth: '600px', backgroundColor: '#f8f9fa',
            padding: '20px', borderRadius: '8px', color: '#212529'
        },
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' }
    };

    if (!student) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Editar Aluno" style={customModalStyles}>
            <h2>Editar Aluno: {student.name}</h2>
            {isLoadingData && <Spinner animation="border" role="status"><span className="visually-hidden">Carregando...</span></Spinner>}
            {fetchError && <Alert variant="danger">{fetchError}</Alert>}
            
            {!isLoadingData && !fetchError && (
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="editStudentName" className="mb-3">
                        <Form.Label>Nome do Aluno</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nome do aluno"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="editStudentClass" className="mb-3">
                        <Form.Label>Turma</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            required
                        >
                            <option value="">Selecione uma turma</option>
                            {classesList.map((cls) => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="editStudentResponsible" className="mb-3">
                        <Form.Label>Responsável</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedResponsibleId}
                            onChange={(e) => setSelectedResponsibleId(e.target.value)}
                            required
                        >
                            <option value="">Selecione um responsável</option>
                            {parentsList.map((parent) => (
                                <option key={parent._id} value={parent._id}>
                                    {parent.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={onClose} className="me-2">
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Salvar Alterações
                        </Button>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default EditStudentModal;
