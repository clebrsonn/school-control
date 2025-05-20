import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Button, Form } from 'react-bootstrap';
import { IClass } from '@hyteck/shared';
import { updateClass } from '../../features/classes/services/ClassService';
import notification from '../common/Notification';

interface EditClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    classToEdit: IClass | null;
    onClassUpdated: (updatedClass: IClass) => void;
}

// Assuming Modal.setAppElement is called globally
// Modal.setAppElement('#root'); 

const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, classToEdit, onClassUpdated }) => {
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [enrollmentFee, setEnrollmentFee] = useState(''); // Stored as string for input
    const [monthlyFee, setMonthlyFee] = useState('');     // Stored as string for input

    useEffect(() => {
        if (classToEdit) {
            setName(classToEdit.name || '');
            setStartTime(classToEdit.startTime || '');
            setEndTime(classToEdit.endTime || '');
            setEnrollmentFee(classToEdit.enrollmentFee?.toString() || '');
            setMonthlyFee(classToEdit.monthlyFee?.toString() || '');
        } else {
            // Reset form if no class is provided
            setName('');
            setStartTime('');
            setEndTime('');
            setEnrollmentFee('');
            setMonthlyFee('');
        }
    }, [classToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classToEdit?._id) {
            notification('Erro: ID da turma não encontrado.', 'error');
            return;
        }

        const updatedData: Partial<IClass> = {};
        if (name !== classToEdit.name) updatedData.name = name;
        if (startTime !== classToEdit.startTime) updatedData.startTime = startTime;
        if (endTime !== classToEdit.endTime) updatedData.endTime = endTime;
        
        const enrollmentFeeNum = parseFloat(enrollmentFee);
        const monthlyFeeNum = parseFloat(monthlyFee);

        if (isNaN(enrollmentFeeNum) || isNaN(monthlyFeeNum)) {
            notification('Erro: Taxa de matrícula e mensalidade devem ser números válidos.', 'error');
            return;
        }

        if (enrollmentFeeNum !== classToEdit.enrollmentFee) updatedData.enrollmentFee = enrollmentFeeNum;
        if (monthlyFeeNum !== classToEdit.monthlyFee) updatedData.monthlyFee = monthlyFeeNum;
        
        if (Object.keys(updatedData).length === 0) {
            notification('Nenhuma alteração detectada.', 'info');
            onClose();
            return;
        }

        try {
            const updatedClassResponse = await updateClass(classToEdit._id, updatedData);
            onClassUpdated(updatedClassResponse);
            notification('Turma atualizada com sucesso!', 'success');
            onClose();
        } catch (error) {
            console.error("Failed to update class:", error);
            notification(`Erro ao atualizar turma: ${(error as Error).message || 'Erro desconhecido'}`, 'error');
        }
    };
    
    const customModalStyles = {
        content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            minWidth: '300px', maxWidth: '500px', backgroundColor: '#f8f9fa',
            padding: '20px', borderRadius: '8px', color: '#212529'
        },
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' }
    };

    if (!classToEdit) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Editar Turma" style={customModalStyles}>
            <h2>Editar Turma: {classToEdit.name}</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="editClassName" className="mb-3">
                    <Form.Label>Nome da Turma</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome da turma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="editClassStartTime" className="mb-3">
                    <Form.Label>Horário de Início</Form.Label>
                    <Form.Control
                        type="time" // Consider using type="time" for better UX
                        placeholder="HH:MM"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="editClassEndTime" className="mb-3">
                    <Form.Label>Horário de Término</Form.Label>
                    <Form.Control
                        type="time" // Consider using type="time" for better UX
                        placeholder="HH:MM"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="editClassEnrollmentFee" className="mb-3">
                    <Form.Label>Taxa de Matrícula</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Valor da matrícula"
                        value={enrollmentFee}
                        onChange={(e) => setEnrollmentFee(e.target.value)}
                        required
                        step="0.01" // Allows decimal input
                    />
                </Form.Group>

                <Form.Group controlId="editClassMonthlyFee" className="mb-3">
                    <Form.Label>Mensalidade</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Valor da mensalidade"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                        required
                        step="0.01" // Allows decimal input
                    />
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
        </Modal>
    );
};

export default EditClassModal;
