import React, { useEffect, useState, useMemo } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { IDiscount } from '@hyteck/shared';

import { createDiscount, deleteDiscount, fetchDiscounts } from '../../features/enrollments/services/DiscountService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import EditDiscountModal from '../modals/EditDiscountModal'; // Added import

const DiscountManager: React.FC = () => {
    const [discounts, setDiscounts] = useState<IDiscount[]>([]); // Lista de descontos
    const [name, setName] = useState<string>(""); // Nome do desconto
    const [value, setValue] = useState<number>(0); // Valor fixo do desconto
    const [validUntil, setValidUntil] = useState<string>(""); // Data de validade do desconto
    const [type, setType] = useState<string>("enroll"); // Tipo de desconto
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<IDiscount | null>(null);
    const [error, setError] = useState<string | null>(null); // Erros do formulário
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Mensagem de feedback

    const handleDiscountUpdated = (updatedDiscount: IDiscount) => { // Implemented callback
        setDiscounts(prevDiscounts =>
            prevDiscounts.map(d => (d._id === updatedDiscount._id ? updatedDiscount : d))
        );
        setShowEditModal(false);
        setEditingDiscount(null);
    };

    // Carrega os descontos ao montar o componente
    useEffect(() => {
        const getDiscounts = async () => {
            try {
                const fetchedDiscounts = await fetchDiscounts();
                setDiscounts(fetchedDiscounts);
            } catch (err: any) {
                setError("Erro ao carregar os descontos.");
            }
        };
        getDiscounts();
    }, []);

    // Submissão do formulário para adicionar um novo desconto
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || value <= 0 || !validUntil || !type) {
            setError("Por favor, preencha todos os campos corretamente.");
            return;
        }

        try {
            const newDiscount = await createDiscount({ name, value, validUntil, type });
            setDiscounts([...discounts, newDiscount]); // Adiciona o desconto à lista
            setName("");
            setValue(0);
            setValidUntil("");
            setType("enroll");
            setSuccessMessage("Desconto criado com sucesso!");
        } catch (err: any) {
            setError("Erro ao criar o desconto.");
        }
    };

    // Exclusão de um desconto
    const handleDelete = async (id: string) => {
        try {
            await deleteDiscount(id);
            setDiscounts(discounts.filter((discount) => discount._id !== id)); // Atualiza a lista
        } catch (err: any) {
            setError("Erro ao excluir o desconto.");
        }
    };

    const handleEditDiscount = (id: string) => {
        const discountToEdit = discounts.find(d => d._id === id);
        if (discountToEdit) {
            setEditingDiscount(discountToEdit);
            setShowEditModal(true);
            // For now, a simple notification or log, actual modal will be separate
            // console.log("Editing discount:", discountToEdit); 
            // notification(`Editing discount: ${discountToEdit.name}`, 'info'); // Placeholder
        }
    };

    const filteredDiscounts = useMemo(() => {
        if (!searchTerm) {
            return discounts;
        }
        return discounts.filter(discount =>
            discount.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [discounts, searchTerm]);

    return (
        <div>
            <h2>Gerenciamento de Descontos</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="discountName">
                    <Form.Label>Nome do Desconto</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Exemplo: Desconto para alunos novos"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="discountValue">
                    <Form.Label>Valor do Desconto</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Exemplo: 50"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="discountValidUntil">
                    <Form.Label>Validade do Desconto</Form.Label>
                    <Form.Control
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="discountType">
                    <Form.Label>Tipo de Desconto</Form.Label>
                    <Form.Control
                        as="select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                    >
                        <option value="enroll">Matrícula</option>
                        <option value="tuition">Mensalidade</option>
                    </Form.Control>
                </Form.Group>

                <Button type="submit" className="mt-3">
                    Adicionar Desconto
                </Button>
            </Form>

            <h3 className="mt-4">Lista de Descontos</h3>
            <Form.Group controlId="formDiscountSearch" className="mt-4">
                <Form.Label>Buscar Desconto</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Digite o nome do desconto para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-3"
                />
            </Form.Group>
            <ListRegistries data={filteredDiscounts} entityName={'discount'}  onDelete={handleDelete} onEdit={handleEditDiscount} />

            {editingDiscount && (
                <EditDiscountModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingDiscount(null);
                    }}
                    discountToEdit={editingDiscount}
                    onDiscountUpdated={handleDiscountUpdated}
                />
            )}
        </div>
    );
};

export default DiscountManager;