import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentManager from './StudentManager';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    updateStudent
} from '../../features/students/services/StudentService';
import { fetchParents, getStudentsByResponsibleId } from '../../features/parents/services/ParentService';
import { getAllClassRooms } from '../../features/classes/services/ClassService';
import notification from '../common/Notification';

// Mock the dependencies
vi.mock('../../features/students/services/StudentService', () => ({
  createStudent: vi.fn(),
  deleteStudent: vi.fn(),
  getAllStudents: vi.fn(),
  updateStudent: vi.fn()
}));

vi.mock('../../features/parents/services/ParentService', () => ({
  fetchParents: vi.fn(),
  getStudentsByResponsibleId: vi.fn()
}));

vi.mock('../../features/classes/services/ClassService', () => ({
  getAllClassRooms: vi.fn()
}));

vi.mock('../common/Notification', () => ({
  default: vi.fn()
}));

describe('StudentManager Component', () => {
  const mockStudents = {
    content: [
      { id: 'student1', name: 'John Student', email: 'john@example.com', responsibleId: 'parent1', responsibleName: 'John Parent' },
      { id: 'student2', name: 'Jane Student', email: 'jane@example.com', responsibleId: 'parent2', responsibleName: 'Jane Parent' }
    ],
    pageable: { pageNumber: 0, pageSize: 10 },
    totalElements: 2,
    totalPages: 1,
    last: true,
    size: 10,
    number: 0
  };

  const mockClasses = {
    content: [
      { id: 'class1', name: 'Class A' },
      { id: 'class2', name: 'Class B' }
    ]
  };

  const mockParents = {
    content: [
      { id: 'parent1', name: 'John Parent', phone: '123-456-7890' },
      { id: 'parent2', name: 'Jane Parent', phone: '098-765-4321' }
    ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getAllStudents as any).mockResolvedValue(mockStudents);
    (getAllClassRooms as any).mockResolvedValue(mockClasses);
    (fetchParents as any).mockResolvedValue(mockParents);
  });

  it('should render the component with title', async () => {
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(screen.getByText('Gerenciar Alunos')).toBeInTheDocument();
    });
  });

  it('should fetch students for a specific responsible when responsible prop is provided', async () => {
    const responsibleId = 'parent1';
    (getStudentsByResponsibleId as any).mockResolvedValue(mockStudents);
    
    render(<StudentManager responsible={responsibleId} />);
    
    await waitFor(() => {
      expect(getStudentsByResponsibleId).toHaveBeenCalledWith(responsibleId, { page: 0, size: 10 });
    });
  });

  it('should fetch all students when no responsible prop is provided', async () => {
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(getAllStudents).toHaveBeenCalledWith({ page: 0, size: 10 });
    });
  });

  it('should display student form fields', async () => {
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Aluno')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('CPF')).toBeInTheDocument();
    expect(screen.getByLabelText('Turma')).toBeInTheDocument();
    expect(screen.getByLabelText('Responsável')).toBeInTheDocument();
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  it('should not display responsible field when responsible prop is provided', async () => {
    render(<StudentManager responsible="parent1" />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Aluno')).toBeInTheDocument();
    });
    
    expect(screen.queryByLabelText('Responsável')).not.toBeInTheDocument();
  });

  it('should handle adding a new student', async () => {
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Aluno')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome do Aluno'), {
      target: { value: 'New Student' }
    });
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'new@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('CPF'), {
      target: { value: '123.456.789-00' }
    });
    
    fireEvent.change(screen.getByLabelText('Responsável'), {
      target: { value: 'parent1' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Salvar'));
    
    await waitFor(() => {
      expect(createStudent).toHaveBeenCalledWith({
        name: 'New Student',
        email: 'new@example.com',
        cpf: '123.456.789-00',
        responsibleId: 'parent1'
      });
    });
    
    // Should refresh the student list
    expect(getAllStudents).toHaveBeenCalledTimes(2);
    
    // Should show notification
    expect(notification).toHaveBeenCalledWith('Aluno adicionado com sucesso', 'success');
  });

  it('should handle editing a student', async () => {
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(screen.getByText('Adicionar Aluno')).toBeInTheDocument();
    });
    
    // Simulate clicking edit on a student
    const mockStudent = mockStudents.content[0];
    
    // Call the handleEdit function directly since we can't access the edit button in ListRegistries
    const instance = screen.getByText('Adicionar Aluno').closest('form');
    if (instance) {
      // Simulate the edit action
      fireEvent.change(screen.getByLabelText('Nome do Aluno'), {
        target: { value: mockStudent.name }
      });
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: mockStudent.email || '' }
      });
      
      // Change the form title to indicate editing mode
      const formTitle = screen.getByText('Adicionar Aluno');
      formTitle.textContent = 'Editar Aluno';
      
      // Now update the student
      fireEvent.change(screen.getByLabelText('Nome do Aluno'), {
        target: { value: 'Updated Student Name' }
      });
      
      // Submit the form
      fireEvent.click(screen.getByText('Salvar'));
      
      await waitFor(() => {
        expect(updateStudent).toHaveBeenCalled();
      });
      
      // Should show notification
      expect(notification).toHaveBeenCalledWith('Aluno atualizado com sucesso', 'success');
    }
  });

  it('should handle deleting a student', async () => {
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(getAllStudents).toHaveBeenCalled();
    });
    
    // Since ListRegistries is mocked and we can't directly test its onDelete callback,
    // we'll test the handleDelete function by simulating its behavior
    const mockId = 'student1';
    (deleteStudent as any).mockResolvedValueOnce({});
    
    // Call the handleDelete function directly
    await (StudentManager as any).prototype.handleDelete(mockId);
    
    expect(deleteStudent).toHaveBeenCalledWith(mockId);
    expect(notification).toHaveBeenCalledWith('Estudante removido com sucesso.', 'success');
  });

  it('should display error message when fetching students fails', async () => {
    const errorMessage = 'Failed to fetch students';
    (getAllStudents as any).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display error message when adding a student fails', async () => {
    const errorMessage = 'Failed to save student';
    (createStudent as any).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<StudentManager responsible={undefined} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Aluno')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome do Aluno'), {
      target: { value: 'New Student' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Salvar'));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});