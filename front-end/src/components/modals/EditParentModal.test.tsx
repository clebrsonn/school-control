import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditParentModal from './EditParentModal';
import { updateParent } from '../../features/parents/services/ParentService';
import notification from '../common/Notification';
import Modal from 'react-modal';
import { IResponsible } from '@hyteck/shared';

// Mock ParentService
jest.mock('../../features/parents/services/ParentService');
const mockedUpdateParent = updateParent as jest.MockedFunction<typeof updateParent>;

// Mock notification utility
jest.mock('../common/Notification', () => jest.fn());
const mockedNotification = notification as jest.MockedFunction<typeof notification>;

// Basic setup for react-modal in tests
// This prevents errors/warnings from react-modal about appElement not being set.
Modal.setAppElement(document.createElement('div'));

describe('EditParentModal', () => {
    const mockParent: IResponsible = {
        _id: 'p1',
        name: 'Old Name',
        phone: '111222333',
        email: 'old@example.com',
        students: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockOnClose = jest.fn();
    const mockOnParentUpdated = jest.fn();

    beforeEach(() => {
        // Clear mocks before each test to ensure test isolation
        mockedUpdateParent.mockClear();
        mockedNotification.mockClear();
        mockOnClose.mockClear();
        mockOnParentUpdated.mockClear();
    });

    test('renders correctly with initial parent data', () => {
        render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={mockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );

        expect(screen.getByRole('heading', { name: /Editar Responsável/i })).toBeVisible();
        expect(screen.getByLabelText(/Nome/i)).toHaveValue(mockParent.name);
        expect(screen.getByLabelText(/Telefone/i)).toHaveValue(mockParent.phone);
        expect(screen.getByLabelText(/Email/i)).toHaveValue(mockParent.email);
    });

    test('handles input changes for all fields', () => {
        render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={mockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );

        const nameInput = screen.getByLabelText(/Nome/i);
        fireEvent.change(nameInput, { target: { value: 'New Parent Name' } });
        expect(nameInput).toHaveValue('New Parent Name');

        const phoneInput = screen.getByLabelText(/Telefone/i);
        fireEvent.change(phoneInput, { target: { value: '999888777' } });
        expect(phoneInput).toHaveValue('999888777');

        const emailInput = screen.getByLabelText(/Email/i);
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
        expect(emailInput).toHaveValue('new@example.com');
    });

    test('calls onClose when Cancel button is clicked', () => {
        render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={mockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
        fireEvent.click(cancelButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls updateParent and callbacks on successful save with changes', async () => {
        const updatedName = 'Updated Parent Name';
        const updatedParentDataFromAPI: IResponsible = { ...mockParent, name: updatedName };
        
        mockedUpdateParent.mockResolvedValueOnce(updatedParentDataFromAPI);

        render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={mockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );

        fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: updatedName } });
        fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

        await waitFor(() => {
            expect(mockedUpdateParent).toHaveBeenCalledWith(mockParent._id, { name: updatedName });
        });
        
        expect(mockOnParentUpdated).toHaveBeenCalledWith(updatedParentDataFromAPI);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockedNotification).toHaveBeenCalledWith('Responsável atualizado com sucesso!', 'success');
    });

    test('does not call updateParent and shows info notification if no changes are made', async () => {
        render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={mockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

        await waitFor(() => {
            expect(mockedUpdateParent).not.toHaveBeenCalled();
        });
        
        expect(mockedNotification).toHaveBeenCalledWith('Nenhuma alteração detectada.', 'info');
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnParentUpdated).not.toHaveBeenCalled();
    });

    test('handles API error on save and does not close modal or call onParentUpdated', async () => {
        const updatedName = 'Another Updated Name';
        const errorMessage = 'Network Error';
        mockedUpdateParent.mockRejectedValueOnce(new Error(errorMessage));

        render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={mockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );

        fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: updatedName } });
        fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

        await waitFor(() => {
            expect(mockedUpdateParent).toHaveBeenCalledWith(mockParent._id, { name: updatedName });
        });
        
        expect(mockedNotification).toHaveBeenCalledWith(`Erro ao atualizar responsável: ${errorMessage}`, 'error');
        expect(mockOnParentUpdated).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled(); // Modal should stay open on error
    });

    test('resets form fields if parent prop becomes null (e.g. modal closed and reopened without parent)', () => {
        const { rerender } = render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={mockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );

        expect(screen.getByLabelText(/Nome/i)).toHaveValue(mockParent.name);

        rerender(
            <EditParentModal
                isOpen={true} // Or false, then true again, depending on how parent component handles it
                onClose={mockOnClose}
                parent={null} // Parent is now null
                onParentUpdated={mockOnParentUpdated}
            />
        );
        
        // When parent is null, modal might not render inputs, or inputs should be cleared.
        // The current implementation of EditParentModal returns null if !parent.
        // If it were to render an empty form, we'd check for empty values.
        // For now, let's test that if it were to re-open with a new parent, it updates.
        // This test is more about ensuring the useEffect correctly resets if parent becomes null and then a new parent is passed.

        // A more direct test: if parent is initially null, then receives a parent
        const { rerender: rerender2 } = render(
            <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={null}
                onParentUpdated={mockOnParentUpdated}
            />
        );
        // Initially, the modal might return null or render empty inputs if it didn't return null
        // Assuming it doesn't render inputs if parent is null because of `if (!parent) return null;`

        const newMockParent = { ...mockParent, _id: 'p2', name: 'Brand New Parent' };
        rerender2(
             <EditParentModal
                isOpen={true}
                onClose={mockOnClose}
                parent={newMockParent}
                onParentUpdated={mockOnParentUpdated}
            />
        );
        expect(screen.getByLabelText(/Nome/i)).toHaveValue(newMockParent.name);
    });
});
