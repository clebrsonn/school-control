import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ParentManager from './ParentManager';
import { createParent, deleteParent, fetchParents } from '../../features/parents/services/ParentService';
import notification from '../common/Notification';

// Mock the dependencies
vi.mock('../../features/parents/services/ParentService', () => ({
  fetchParents: vi.fn(),
  createParent: vi.fn(),
  deleteParent: vi.fn()
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

vi.mock('../common/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('ParentManager Component', () => {
  const mockParents = {
    content: [
      { id: 'parent1', name: 'John Doe', phone: '123-456-7890', students: [] },
      { id: 'parent2', name: 'Jane Smith', phone: '098-765-4321', students: [] }
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
    (fetchParents as any).mockResolvedValue(mockParents);
  });

  it('should render loading spinner initially', async () => {
    // Mock loading state
    (fetchParents as any).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(mockParents), 100)));
    
    render(<ParentManager />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render the component with title after loading', async () => {
    render(<ParentManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Gerenciar Responsáveis')).toBeInTheDocument();
    });
    
    expect(fetchParents).toHaveBeenCalledWith(0, 10);
  });

  it('should display parent form fields', async () => {
    render(<ParentManager />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should handle adding a new parent', async () => {
    render(<ParentManager />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'New Parent' }
    });
    
    fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '555-123-4567' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(createParent).toHaveBeenCalledWith({
        name: 'New Parent',
        phone: '555-123-4567',
        students: []
      });
    });
    
    // Should refresh the parent list
    expect(fetchParents).toHaveBeenCalledTimes(2);
    
    // Should show notification
    expect(notification).toHaveBeenCalledWith('Parent added successfully', 'success');
  });

  it('should handle deleting a parent', async () => {
    // Mock the ListRegistries component by rendering the parents directly
    (fetchParents as any).mockResolvedValueOnce(mockParents);
    
    const { container } = render(<ParentManager />);
    
    await waitFor(() => {
      expect(fetchParents).toHaveBeenCalled();
    });
    
    // Since ListRegistries is mocked and we can't directly test its onDelete callback,
    // we'll test the handleDelete function by simulating its behavior
    const instance = container.querySelector('button[aria-label="Delete parents"]');
    
    // If the delete button is found, click it
    if (instance) {
      fireEvent.click(instance);
      
      await waitFor(() => {
        expect(deleteParent).toHaveBeenCalled();
        expect(notification).toHaveBeenCalledWith('Responsável removido com sucesso.', 'success');
      });
    } else {
      // If the button isn't found, we'll test the function directly
      const mockId = 'parent1';
      (deleteParent as any).mockResolvedValueOnce({});
      
      // Call the handleDelete function directly
      await (ParentManager as any).prototype.handleDelete(mockId);
      
      expect(deleteParent).toHaveBeenCalledWith(mockId);
      expect(notification).toHaveBeenCalledWith('Responsável removido com sucesso.', 'success');
    }
  });

  it('should display error message when fetching parents fails', async () => {
    const errorMessage = 'Failed to fetch parents';
    (fetchParents as any).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ParentManager />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display error message when adding a parent fails', async () => {
    const errorMessage = 'Failed to add parent';
    (createParent as any).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ParentManager />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'New Parent' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should reset form after successful parent creation', async () => {
    render(<ParentManager />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'New Parent' }
    });
    
    fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '555-123-4567' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(createParent).toHaveBeenCalled();
    });
    
    // Form should be reset
    expect(screen.getByLabelText('Nome')).toHaveValue('');
    expect(screen.getByLabelText('Telefone')).toHaveValue('');
  });
});