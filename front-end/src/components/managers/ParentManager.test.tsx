import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParentManager from './ParentManager';
import { fetchParents, updateParent, createParent, deleteParent } from '../../features/parents/services/ParentService'; // Path to mock
import notification from '../common/Notification'; // Path to mock
import Modal from 'react-modal'; // Import Modal

// Mock ParentService
jest.mock('../../features/parents/services/ParentService', () => ({
    fetchParents: jest.fn(),
    updateParent: jest.fn(),
    createParent: jest.fn(),
    deleteParent: jest.fn(),
}));
const mockedFetchParents = fetchParents as jest.MockedFunction<typeof fetchParents>;
const mockedUpdateParent = updateParent as jest.MockedFunction<typeof updateParent>;
// const mockedCreateParent = createParent as jest.MockedFunction<typeof createParent>; // For future tests
// const mockedDeleteParent = deleteParent as jest.MockedFunction<typeof deleteParent>; // For future tests


// Mock react-router-dom because ListRegistries uses Link
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Preserve other exports
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
}));

// Mock notification utility
jest.mock('../common/Notification', () => jest.fn());
const mockedNotification = notification as jest.MockedFunction<typeof notification>;

// Basic setup for react-modal in tests
Modal.setAppElement(document.createElement('div'));

describe('ParentManager Search Functionality', () => {
    const mockParentsData = [
        { _id: 's1', name: 'Alice Wonderland', phone: '1234567890', email: 'alice@example.com', students: [], createdAt: new Date(), updatedAt: new Date() },
        { _id: 's2', name: 'Bob The Builder', phone: '0987654321', email: 'bob@example.com', students: [], createdAt: new Date(), updatedAt: new Date() },
        { _id: 's3', name: 'Charlie Brown', phone: '1122334455', email: 'charlie@example.com', students: [], createdAt: new Date(), updatedAt: new Date() },
    ];

    beforeEach(() => {
        mockedFetchParents.mockReset();
        mockedNotification.mockClear();
    });

    test('renders ParentManager and search input', async () => {
        mockedFetchParents.mockResolvedValueOnce([...mockParentsData]);
        render(<ParentManager />);
        
        expect(await screen.findByText('Gerenciar Responsáveis')).toBeVisible();
        expect(screen.getByPlaceholderText('Digite o nome para buscar...')).toBeVisible();
    });

    test('filters parents by name when typing in search input', async () => {
        mockedFetchParents.mockResolvedValueOnce([...mockParentsData]);
        render(<ParentManager />);

        expect(await screen.findByText('Alice Wonderland')).toBeVisible();
        expect(screen.getByText('Bob The Builder')).toBeVisible();
        expect(screen.getByText('Charlie Brown')).toBeVisible();

        const searchInput = screen.getByPlaceholderText('Digite o nome para buscar...');
        fireEvent.change(searchInput, { target: { value: 'Alice' } });

        expect(screen.getByText('Alice Wonderland')).toBeVisible();
        expect(screen.queryByText('Bob The Builder')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    });

    test('shows all parents when search input is cleared', async () => {
        mockedFetchParents.mockResolvedValueOnce([...mockParentsData]);
        render(<ParentManager />);

        expect(await screen.findByText('Alice Wonderland')).toBeVisible(); 

        const searchInput = screen.getByPlaceholderText('Digite o nome para buscar...');
        
        fireEvent.change(searchInput, { target: { value: 'Alice' } });
        expect(screen.getByText('Alice Wonderland')).toBeVisible();
        expect(screen.queryByText('Bob The Builder')).not.toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: '' } });
        
        expect(await screen.findByText('Alice Wonderland')).toBeVisible();
        expect(screen.getByText('Bob The Builder')).toBeVisible();
        expect(screen.getByText('Charlie Brown')).toBeVisible();
    });

    test('shows "Nenhum parent encontrado." message when no parents match search', async () => {
        mockedFetchParents.mockResolvedValueOnce([...mockParentsData]);
        render(<ParentManager />);

        expect(await screen.findByText('Alice Wonderland')).toBeVisible(); 

        const searchInput = screen.getByPlaceholderText('Digite o nome para buscar...');
        fireEvent.change(searchInput, { target: { value: 'NonExistentName' } });
        
        expect(screen.queryByText('Alice Wonderland')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob The Builder')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
        
        expect(screen.getByText('Nenhum parent encontrado.')).toBeVisible();
    });
    
    test('search is case-insensitive', async () => {
        mockedFetchParents.mockResolvedValueOnce([...mockParentsData]);
        render(<ParentManager />);

        expect(await screen.findByText('Alice Wonderland')).toBeVisible();

        const searchInput = screen.getByPlaceholderText('Digite o nome para buscar...');
        fireEvent.change(searchInput, { target: { value: 'bob the builder' } });

        expect(screen.getByText('Bob The Builder')).toBeVisible();
        expect(screen.queryByText('Alice Wonderland')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    });
});

describe('ParentManager Edit Functionality', () => {
    const mockParents = [
        { _id: 'p1', name: 'Alice Wonderland', phone: '123', email: 'alice@example.com', students: [], createdAt: new Date(), updatedAt: new Date() },
        { _id: 'p2', name: 'Bob The Builder', phone: '456', email: 'bob@example.com', students: [], createdAt: new Date(), updatedAt: new Date() },
    ];

    beforeEach(() => {
        mockedFetchParents.mockResolvedValue([...mockParents]);
        mockedUpdateParent.mockReset(); 
        mockedNotification.mockClear();
    });

    test('opens edit modal with correct data when Edit button is clicked', async () => {
        render(<ParentManager />);
        
        expect(await screen.findByText('Alice Wonderland')).toBeVisible();

        const aliceRow = screen.getByText('Alice Wonderland').closest('tr');
        if (!aliceRow) throw new Error('Row for Alice Wonderland not found');
        const editButtonForAlice = within(aliceRow).getByRole('button', { name: /Editar/i });
        
        fireEvent.click(editButtonForAlice);

        const modal = await screen.findByRole('dialog', { name: /Editar Responsável/i });
        expect(modal).toBeVisible();
        
        expect(within(modal).getByLabelText(/Nome/i)).toHaveValue('Alice Wonderland');
        expect(within(modal).getByLabelText(/Telefone/i)).toHaveValue('123');
        expect(within(modal).getByLabelText(/Email/i)).toHaveValue('alice@example.com');
    });

    test('updates parent in the list after successful edit via modal', async () => {
        const initialAlice = mockParents.find(p => p._id === 'p1')!;
        const finalAliceData = { ...initialAlice, name: 'Alice In Chains', phone: '321' }; // Email remains unchanged
        
        mockedUpdateParent.mockResolvedValue(finalAliceData);

        render(<ParentManager />);
        
        expect(await screen.findByText('Alice Wonderland')).toBeVisible();

        const aliceRow = screen.getByText('Alice Wonderland').closest('tr');
        if (!aliceRow) throw new Error('Row for Alice Wonderland not found');
        const editButtonForAlice = within(aliceRow).getByRole('button', { name: /Editar/i });
        fireEvent.click(editButtonForAlice);

        const modal = await screen.findByRole('dialog', { name: /Editar Responsável/i });
        expect(modal).toBeVisible();

        const nameInputInModal = within(modal).getByLabelText(/Nome/i);
        fireEvent.change(nameInputInModal, { target: { value: 'Alice In Chains' } });

        const phoneInputInModal = within(modal).getByLabelText(/Telefone/i);
        fireEvent.change(phoneInputInModal, { target: { value: '321' } });

        const saveButtonInModal = within(modal).getByRole('button', { name: /Salvar Alterações/i });
        fireEvent.click(saveButtonInModal);

        await waitFor(() => {
            // Expecting only changed fields to be sent
            expect(mockedUpdateParent).toHaveBeenCalledWith('p1', { name: 'Alice In Chains', phone: '321' });
        });
        
        // Wait for modal to close
        await waitFor(() => {
            expect(screen.queryByRole('dialog', { name: /Editar Responsável/i })).not.toBeInTheDocument();
        });

        // Check if the list updated in ParentManager
        expect(await screen.findByText('Alice In Chains')).toBeVisible();
        // Assuming phone is displayed directly or via ListRegistries structure.
        // If ListRegistries renders 'phone' directly as a column:
        expect(screen.getByText('321')).toBeVisible(); 
        expect(screen.queryByText('Alice Wonderland')).not.toBeInTheDocument();
        expect(mockedNotification).toHaveBeenCalledWith('Responsável atualizado com sucesso!', 'success');
    });
});
