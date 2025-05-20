import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditStudentModal from './EditStudentModal';
import { updateStudent } from '../../features/students/services/StudentService';
import { fetchClasses } from '../../features/classes/services/ClassService';
import { fetchParents } from '../../features/parents/services/ParentService';
import notification from '../common/Notification';
import Modal from 'react-modal';
import { IStudent, IClass, IResponsible } from '@hyteck/shared';

// Mock Services
jest.mock('../../features/students/services/StudentService');
jest.mock('../../features/classes/services/ClassService');
jest.mock('../../features/parents/services/ParentService');

const mockedUpdateStudent = updateStudent as jest.MockedFunction<typeof updateStudent>;
const mockedFetchClasses = fetchClasses as jest.MockedFunction<typeof fetchClasses>;
const mockedFetchParents = fetchParents as jest.MockedFunction<typeof fetchParents>;

// Mock notification utility
jest.mock('../common/Notification', () => jest.fn());
const mockedNotification = notification as jest.MockedFunction<typeof notification>;

// Basic setup for react-modal in tests
Modal.setAppElement(document.createElement('div'));

describe('EditStudentModal', () => {
    const mockStudent: IStudent = {
        _id: 's1',
        name: 'Student Alpha',
        classId: 'c1', // Can be string or IClass object depending on how it's fetched initially
        responsible: 'p1', // Can be string or IResponsible object
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Explicitly type mockClasses and mockParents with IClass[] and IResponsible[]
    const mockClasses: IClass[] = [
        { _id: 'c1', name: 'Class A', startTime: '08:00', endTime: '12:00', enrollmentFee: 100, monthlyFee: 50, students: [], createdAt: new Date(), updatedAt: new Date() } as IClass,
        { _id: 'c2', name: 'Class B', startTime: '13:00', endTime: '17:00', enrollmentFee: 120, monthlyFee: 60, students: [], createdAt: new Date(), updatedAt: new Date() } as IClass,
    ];

    const mockParents: IResponsible[] = [
        { _id: 'p1', name: 'Parent Omega', phone: '123', students: [], email: 'omega@test.com', createdAt: new Date(), updatedAt: new Date() } as IResponsible,
        { _id: 'p2', name: 'Parent Zeta', phone: '456', students: [], email: 'zeta@test.com', createdAt: new Date(), updatedAt: new Date() } as IResponsible,
    ];


    const mockOnClose = jest.fn();
    const mockOnStudentUpdated = jest.fn();

    beforeEach(() => {
        mockedUpdateStudent.mockClear();
        mockedFetchClasses.mockClear();
        mockedFetchParents.mockClear();
        mockedNotification.mockClear();
        mockOnClose.mockClear();
        mockOnStudentUpdated.mockClear();

        // Default successful mocks for dropdown data
        mockedFetchClasses.mockResolvedValue([...mockClasses]);
        mockedFetchParents.mockResolvedValue([...mockParents]);
    });

    test('renders correctly, fetches dropdown data, and pre-fills form', async () => {
        render(
            <EditStudentModal
                isOpen={true}
                onClose={mockOnClose}
                student={mockStudent}
                onStudentUpdated={mockOnStudentUpdated}
            />
        );

        expect(screen.getByRole('heading', { name: /Editar Aluno: Student Alpha/i })).toBeVisible();
        
        expect(mockedFetchClasses).toHaveBeenCalledTimes(1);
        expect(mockedFetchParents).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(screen.getByLabelText(/Nome do Aluno/i)).toHaveValue(mockStudent.name);
        });
        
        const classSelect = screen.getByLabelText(/Turma/i) as HTMLSelectElement;
        expect(classSelect).toHaveValue('c1');
        expect(await screen.findByText('Class A')).toBeVisible(); 
        
        const responsibleSelect = screen.getByLabelText(/Responsável/i) as HTMLSelectElement;
        expect(responsibleSelect).toHaveValue('p1');
        expect(await screen.findByText('Parent Omega')).toBeVisible();
    });

    test('handles input changes for name and dropdowns', async () => {
        render(
            <EditStudentModal
                isOpen={true}
                onClose={mockOnClose}
                student={mockStudent}
                onStudentUpdated={mockOnStudentUpdated}
            />
        );

        await waitFor(() => expect(screen.getByLabelText(/Nome do Aluno/i)).toBeVisible());

        const nameInput = screen.getByLabelText(/Nome do Aluno/i);
        fireEvent.change(nameInput, { target: { value: 'New Student Name' } });
        expect(nameInput).toHaveValue('New Student Name');

        const classSelect = screen.getByLabelText(/Turma/i);
        fireEvent.change(classSelect, { target: { value: 'c2' } });
        expect(classSelect).toHaveValue('c2');

        const responsibleSelect = screen.getByLabelText(/Responsável/i);
        fireEvent.change(responsibleSelect, { target: { value: 'p2' } });
        expect(responsibleSelect).toHaveValue('p2');
    });

    test('calls onClose when Cancel button is clicked', async () => {
        render(
            <EditStudentModal
                isOpen={true}
                onClose={mockOnClose}
                student={mockStudent}
                onStudentUpdated={mockOnStudentUpdated}
            />
        );
        await waitFor(() => expect(screen.getByLabelText(/Nome do Aluno/i)).toBeVisible());
        fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls updateStudent and callbacks on successful save with changes', async () => {
        const updatedName = 'Updated Student Name';
        const updatedClassId = 'c2';
        // Ensure the mock API response has all required fields of IStudent
        const updatedStudentDataFromAPI: IStudent = { 
            ...mockStudent, 
            name: updatedName, 
            classId: updatedClassId,
            // Ensure all other required fields are present
            responsible: mockStudent.responsible, 
            createdAt: mockStudent.createdAt || new Date(),
            updatedAt: new Date(),
         };
        
        mockedUpdateStudent.mockResolvedValueOnce(updatedStudentDataFromAPI);

        render(
            <EditStudentModal
                isOpen={true}
                onClose={mockOnClose}
                student={mockStudent}
                onStudentUpdated={mockOnStudentUpdated}
            />
        );
        await waitFor(() => expect(screen.getByLabelText(/Nome do Aluno/i)).toBeVisible());

        fireEvent.change(screen.getByLabelText(/Nome do Aluno/i), { target: { value: updatedName } });
        fireEvent.change(screen.getByLabelText(/Turma/i), { target: { value: updatedClassId } });

        fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

        await waitFor(() => {
            expect(mockedUpdateStudent).toHaveBeenCalledWith(mockStudent._id, {
                name: updatedName,
                classId: updatedClassId,
            });
        });
        
        expect(mockOnStudentUpdated).toHaveBeenCalledWith(updatedStudentDataFromAPI);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockedNotification).toHaveBeenCalledWith('Aluno atualizado com sucesso!', 'success');
    });

    test('does not call updateStudent if no changes are made', async () => {
        render(
            <EditStudentModal
                isOpen={true}
                onClose={mockOnClose}
                student={mockStudent}
                onStudentUpdated={mockOnStudentUpdated}
            />
        );
        await waitFor(() => expect(screen.getByLabelText(/Nome do Aluno/i)).toBeVisible());

        fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

        await waitFor(() => { // Give time for any async operations if they were to happen
            expect(mockedUpdateStudent).not.toHaveBeenCalled();
        });
        
        expect(mockedNotification).toHaveBeenCalledWith('Nenhuma alteração detectada.', 'info');
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnStudentUpdated).not.toHaveBeenCalled();
    });

    test('handles API error on save for updateStudent', async () => {
        const errorMessage = 'Update Failed';
        mockedUpdateStudent.mockRejectedValueOnce(new Error(errorMessage));

        render(
            <EditStudentModal
                isOpen={true}
                onClose={mockOnClose}
                student={mockStudent}
                onStudentUpdated={mockOnStudentUpdated}
            />
        );
        await waitFor(() => expect(screen.getByLabelText(/Nome do Aluno/i)).toBeVisible());

        fireEvent.change(screen.getByLabelText(/Nome do Aluno/i), { target: { value: 'Attempted Update' } });
        fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

        await waitFor(() => {
            expect(mockedUpdateStudent).toHaveBeenCalled();
        });
        
        expect(mockedNotification).toHaveBeenCalledWith(`Erro ao atualizar aluno: ${errorMessage}`, 'error');
        expect(mockOnStudentUpdated).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('handles error when fetching dropdown data (e.g., classes)', async () => {
        const fetchErrorMessage = 'Failed to load classes';
        mockedFetchClasses.mockRejectedValueOnce(new Error(fetchErrorMessage));

        render(
            <EditStudentModal
                isOpen={true}
                onClose={mockOnClose}
                student={mockStudent}
                onStudentUpdated={mockOnStudentUpdated}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Erro ao carregar dados para os campos de seleção. Tente novamente.")).toBeVisible();
        });
        expect(mockedNotification).toHaveBeenCalledWith("Erro ao carregar dados para os campos de seleção.", "error");
        
        expect(screen.queryByLabelText(/Nome do Aluno/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Salvar Alterações/i })).not.toBeInTheDocument();
    });
});
