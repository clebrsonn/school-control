import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Button, Form } from 'react-bootstrap';
import { IDiscount } from '@hyteck/shared';
import { updateDiscount } from '../../features/enrollments/services/DiscountService';
import notification from '../common/Notification';

interface EditDiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    discountToEdit: IDiscount | null;
    onDiscountUpdated: (updatedDiscount: IDiscount) => void;
}

// Assuming Modal.setAppElement is called globally
// Modal.setAppElement('#root');

const EditDiscountModal: React.FC<EditDiscountModalProps> = ({ isOpen, onClose, discountToEdit, onDiscountUpdated }) => {
    const [name, setName] = useState('');
    const [value, setValue] = useState(''); // Stored as string for input
    const [validUntil, setValidUntil] = useState(''); // Stored as string for date input
    const [type, setType] = useState<'enroll' | 'tuition'>('enroll');

    useEffect(() => {
        if (discountToEdit) {
            setName(discountToEdit.name || '');
            setValue(discountToEdit.value?.toString() || '');
            // Format validUntil for date input (YYYY-MM-DD)
            setValidUntil(discountToEdit.validUntil ? new Date(discountToEdit.validUntil).toISOString().split('T')[0] : '');
            setType(discountToEdit.type || 'enroll');
        } else {
            // Reset form if no discount is provided
            setName('');
            setValue('');
            setValidUntil('');
            setType('enroll');
        }
    }, [discountToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!discountToEdit?._id) {
            notification('Erro: ID do desconto não encontrado.', 'error');
            return;
        }

        const updatedData: Partial<IDiscount> = {};
        if (name !== discountToEdit.name) updatedData.name = name;
        if (type !== discountToEdit.type) updatedData.type = type;

        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            notification('Erro: Valor do desconto deve ser um número válido.', 'error');
            return;
        }
        if (numericValue !== discountToEdit.value) updatedData.value = numericValue;

        // Compare dates by creating Date objects from the YYYY-MM-DD string and the original date
        const originalValidUntilDate = discountToEdit.validUntil ? new Date(discountToEdit.validUntil).toISOString().split('T')[0] : null;
        if (validUntil !== originalValidUntilDate) {
            updatedData.validUntil = new Date(validUntil); // Convert back to Date object for backend
        }
        
        if (Object.keys(updatedData).length === 0) {
            notification('Nenhuma alteração detectada.', 'info');
            onClose();
            return;
        }

        try {
            const updatedDiscountResponse = await updateDiscount(discountToEdit._id, updatedData);
            onDiscountUpdated(updatedDiscountResponse);
            notification('Desconto atualizado com sucesso!', 'success');
            onClose();
        } catch (error) {
            console.error("Failed to update discount:", error);
            notification(`Erro ao atualizar desconto: ${(error as Error).message || 'Erro desconhecido'}`, 'error');
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

    if (!discountToEdit) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Editar Desconto" style={customModalStyles}>
            <h2>Editar Desconto: {discountToEdit.name}</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="editDiscountName" className="mb-3">
                    <Form.Label>Nome do Desconto</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome do desconto"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="editDiscountValue" className="mb-3">
                    <Form.Label>Valor do Desconto</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Valor do desconto"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                        step="0.01" // Allows decimal input
                    />
                </Form.Group>

                <Form.Group controlId="editDiscountValidUntil" className="mb-3">
                    <Form.Label>Validade</Form.Label>
                    <Form.Control
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="editDiscountType" className="mb-3">
                    <Form.Label>Tipo de Desconto</Form.Label>
                    <Form.Control
                        as="select"
                        value={type}
                        onChange={(e) => setType(e.target.value as 'enroll' | 'tuition')}
                        required
                    >
                        <option value="enroll">Matrícula</option>
                        <option value="tuition">Mensalidade</option>
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
        </Modal>
    );
};

export default EditDiscountModal;
