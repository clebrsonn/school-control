import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClassManager from './ClassManager';
import { createClassRoom, deleteClassRoom, getAllClassRooms } from '../../features/classes/services/ClassService';
import notification from '../common/Notification';

// Mock the dependencies
vi.mock('../../features/classes/services/ClassService', () => ({
  getAllClassRooms: vi.fn(),
  createClassRoom: vi.fn(),
  deleteClassRoom: vi.fn()
}));

vi.mock('../common/Notification', () => ({
  default: vi.fn()
}));

vi.mock('../../hooks/usePagination', () => ({
  usePagination: () => ({
    currentPage: 0,
    pageSize: 10,
    handlePageChange: vi.fn(),
    createEmptyPageResponse: () => ({
      content: [],
      pageable: { pageNumber: 0, pageSize: 10 },
      totalElements: 0,
      totalPages: 0,
      last: true,
      size: 10,
      number: 0
    })
  })
}));

describe('ClassManager Component', () => {
  const mockClasses = {
    content: [
      { id: 'class1', name: 'Class A', schoolYear: '2023' },
      { id: 'class2', name: 'Class B', schoolYear: '2023' }
    ],
    pageable: { pageNumber: 0, pageSize: 10 },
    totalElements: 2,
    totalPages: 1,
    last: true,
    size: 10,
    number: 0
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getAllClassRooms as any).mockResolvedValue(mockClasses);
  });

  it('should render the component with title', async () => {
    render(<ClassManager />);
    
    expect(screen.getByText('Classes')).toBeInTheDocument();
    await waitFor(() => {
      expect(getAllClassRooms).toHaveBeenCalledWith({ page: 0, size: 10 });
    });
  });

  it('should display class form fields', () => {
    render(<ClassManager />);
    
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Horário de início')).toBeInTheDocument();
    expect(screen.getByLabelText('Horário de término')).toBeInTheDocument();
    expect(screen.getByLabelText('Matrícula')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensalidade')).toBeInTheDocument();
    expect(screen.getByText('Add Class')).toBeInTheDocument();
  });

  it('should handle adding a new class', async () => {
    render(<ClassManager />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'New Class' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Class'));
    
    await waitFor(() => {
      expect(createClassRoom).toHaveBeenCalledWith({
        name: 'New Class',
        schoolYear: expect.any(String) // Current year as string
      });
    });
    
    // Should refresh the class list
    expect(getAllClassRooms).toHaveBeenCalledTimes(2);
  });

  it('should handle deleting a class', async () => {
    // Mock the ListRegistries component by rendering the classes directly
    (getAllClassRooms as any).mockResolvedValueOnce(mockClasses);
    
    const { container } = render(<ClassManager />);
    
    await waitFor(() => {
      expect(getAllClassRooms).toHaveBeenCalled();
    });
    
    // Since ListRegistries is mocked and we can't directly test its onDelete callback,
    // we'll test the handleDelete function by simulating its behavior
    const instance = container.querySelector('button[aria-label="Delete classe"]');
    
    // If the delete button is found, click it
    if (instance) {
      fireEvent.click(instance);
      
      await waitFor(() => {
        expect(deleteClassRoom).toHaveBeenCalled();
        expect(notification).toHaveBeenCalledWith('Turma removida com sucesso.');
      });
    } else {
      // If the button isn't found, we'll test the function directly by mocking it
      const mockId = 'class1';
      (deleteClassRoom as any).mockResolvedValueOnce({});
      
      // Call the handleDelete function directly
      await (ClassManager as any).prototype.handleDelete(mockId);
      
      expect(deleteClassRoom).toHaveBeenCalledWith(mockId);
      expect(notification).toHaveBeenCalledWith('Turma removida com sucesso.');
    }
  });

  it('should display error message when fetching classes fails', async () => {
    (getAllClassRooms as any).mockRejectedValueOnce(new Error('Failed to fetch classes'));
    
    render(<ClassManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch classes')).toBeInTheDocument();
    });
  });

  it('should display error message when adding a class fails', async () => {
    (createClassRoom as any).mockRejectedValueOnce(new Error('Failed to add class'));
    
    render(<ClassManager />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'New Class' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Class'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to add class')).toBeInTheDocument();
    });
  });
});