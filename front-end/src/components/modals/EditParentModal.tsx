import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Button, Form } from 'react-bootstrap';
import { IResponsible } from '@hyteck/shared';
import { updateParent } from '../../features/parents/services/ParentService';
import notification from '../common/Notification';

interface EditParentModalProps {
    isOpen: boolean;
    onClose: () => void;
    parent: IResponsible | null;
    onParentUpdated: (updatedParent: IResponsible) => void;
}

// Bind modal to app element for accessibility (usually done in your main app file)
// Modal.setAppElement('#root'); // Example, adjust if your root element has a different ID

const EditParentModal: React.FC<EditParentModalProps> = ({ isOpen, onClose, parent, onParentUpdated }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (parent) {
            setName(parent.name || '');
            setPhone(parent.phone || '');
            setEmail(parent.email || '');
        } else {
            // Reset form if no parent is provided (e.g., modal is closed and props are reset)
            setName('');
            setPhone('');
            setEmail('');
        }
    }, [parent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parent?._id) {
            notification('Erro: ID do responsável não encontrado.', 'error');
            return;
        }

        const updatedData: Partial<IResponsible> = {};
        if (name !== parent.name) updatedData.name = name;
        if (phone !== parent.phone) updatedData.phone = phone;
        if (email !== parent.email) updatedData.email = email;
        
        // If no changes were made, simply close the modal
        if (Object.keys(updatedData).length === 0) {
            notification('Nenhuma alteração detectada.', 'info');
            onClose();
            return;
        }


        try {
            const updatedParentResponse = await updateParent(parent._id, updatedData);
            onParentUpdated(updatedParentResponse);
            notification('Responsável atualizado com sucesso!', 'success');
            onClose();
        } catch (error) {
            console.error("Failed to update parent:", error);
            notification(`Erro ao atualizar responsável: ${(error as Error).message || 'Erro desconhecido'}`, 'error');
        }
    };
    
    // Custom styles for the modal to ensure it's visible over dark backgrounds
    // and has a decent default size.
    const customModalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '300px',
            maxWidth: '500px',
            backgroundColor: '#f8f9fa', // Light background for the modal content
            padding: '20px',
            borderRadius: '8px',
            color: '#212529' // Dark text for readability
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)' // Dark overlay
        }
    };


    if (!parent) {
        return null; // Or some loading/empty state if the modal is open without a parent
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onClose} 
            contentLabel="Editar Responsável"
            style={customModalStyles} // Apply custom styles
            // appElement={document.getElementById('root') as HTMLElement} // Ensure this matches your app's root element
        >
            <h2>Editar Responsável</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="editParentName" className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome do responsável"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="editParentPhone" className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Telefone do responsável"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="editParentEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Email do responsável (opcional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

export default EditParentModal;
