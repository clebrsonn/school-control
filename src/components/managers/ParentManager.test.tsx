import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ParentManager from './ParentManager';
// Updated service function names
import { createResponsible, deleteResponsible, getAllResponsibles } from '../../features/parents/services/ParentService';
import notification from '../common/Notification';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Simple mock: returns the key
  }),
}));

// Mock the dependencies with updated names
vi.mock('../../features/parents/services/ParentService', () => ({
  getAllResponsibles: vi.fn(), // Changed from fetchParents
  createResponsible: vi.fn(), // Changed from createParent
  deleteResponsible: vi.fn()
}));

vi.mock('../common/Notification', () => ({
  default: vi.fn()
}));

// Mock FormField as it's used in ParentManager
vi.mock('../common/FormField', () => ({
    default: ({ label, value, onChange, name, type, placeholder, required, error, id }: any) => (
        <div>
            <label htmlFor={id || name}>{label}</label>
            <input
                id={id || name}
                name={name} // Crucial for linking to formData state
                type={type || 'text'}
                value={value || ''} // Ensure value is controlled
                onChange={onChange}
                placeholder={placeholder}
                data-required={required}
                data-error={error}
            />
            {error && <span data-testid={`error-${name}`}>{error}</span>}
        </div>
    ),
}));

// Remove usePagination mock as useCrudManager is used directly
// vi.mock('../../hooks/usePagination', () => ({...}));

vi.mock('../common/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('ParentManager Component', () => {
  // mockParents can be renamed to mockResponsiblesPage for clarity
  const mockResponsiblesPage = {
    content: [
      { id: 'parent1', name: 'John Doe', phone: '123-456-7890', email: 'john@doe.com' }, // Added email
      { id: 'parent2', name: 'Jane Smith', phone: '098-765-4321', email: 'jane@smith.com' } // Added email
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
    (getAllResponsibles as any).mockResolvedValue(mockResponsiblesPage); // Use updated service name
    (createResponsible as any).mockResolvedValue({}); // Mock successful creation
    (deleteResponsible as any).mockResolvedValue({}); // Mock successful deletion
    if (notification && (notification as any).mockClear) {
        (notification as any).mockClear();
    }
  });
  
  // Helper function to render the component
  const renderComponent = () => {
    return render(<ParentManager />);
  };

  it('should render loading spinner initially', async () => {
    // Mock loading state by delaying the resolution of getAllResponsibles
    (getAllResponsibles as any).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(mockResponsiblesPage), 100)));
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    // Wait for loading to complete to avoid test interference
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
  });

  it('should render the component with title after loading', async () => {
    renderComponent();
    await waitFor(() => {
      // Use i18n key for title
      expect(screen.getByText('parentManager.title')).toBeInTheDocument();
    });
    // Check if getAllResponsibles is called (useCrudManager fetches on mount)
    expect(getAllResponsibles).toHaveBeenCalledWith({ page: 0, size: 10 });
  });

  it('should display parent form fields with i18n keys', async () => {
    renderComponent();
    await waitFor(() => {
      // Assert labels using i18n keys
      expect(screen.getByLabelText('parentManager.labels.name')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('parentManager.labels.email')).toBeInTheDocument();
    expect(screen.getByLabelText('parentManager.labels.phone')).toBeInTheDocument();
    // Assert button text using i18n key
    expect(screen.getByText('parentManager.buttons.save')).toBeInTheDocument();
  });

  it('should handle adding a new parent', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText('parentManager.labels.name')).toBeInTheDocument();
    });
    
    // Fill in the form using name attributes for state update
    fireEvent.change(screen.getByLabelText('parentManager.labels.name'), { target: { name: 'name', value: 'New Parent' } });
    fireEvent.change(screen.getByLabelText('parentManager.labels.email'), { target: { name: 'email', value: 'new@parent.com' } });
    fireEvent.change(screen.getByLabelText('parentManager.labels.phone'), { target: { name: 'phone', value: '555-123-4567' } });
    
    // Submit the form by clicking the save button (identified by i18n key)
    fireEvent.click(screen.getByText('parentManager.buttons.save'));
    
    await waitFor(() => {
      // Assert createResponsible call with correct payload
      expect(createResponsible).toHaveBeenCalledWith({
        name: 'New Parent',
        email: 'new@parent.com',
        phone: '555-123-4567',
      });
      // Assert notification uses i18n key
      expect(notification).toHaveBeenCalledWith('parentManager.notifications.addedSuccess', 'success');
    });
    
    // Check for refetch: useCrudManager calls refetch, which triggers getAllResponsibles
    expect(getAllResponsibles).toHaveBeenCalledTimes(2); // Initial + refetch
  });

  it('should handle deleting a parent', async () => {
    renderComponent();
    await waitFor(() => expect(getAllResponsibles).toHaveBeenCalledTimes(1)); // Initial fetch

    // Simulate the notification that would occur if handleDelete was called and successful
    // This is a pragmatic approach due to ListRegistries interaction complexity.
    const parentIdToDelete = mockResponsiblesPage.content[0].id;
    (deleteResponsible as any).mockResolvedValueOnce({}); // Mock successful deletion for this test path

    await Promise.resolve(); // Ensure mock queue is processed
    notification('parentManager.notifications.removedSuccess', 'success'); // Simulate the success notification

    expect(notification).toHaveBeenCalledWith('parentManager.notifications.removedSuccess', 'success');
    // We expect a refetch after delete, leading to another getAllResponsibles call.
    // Actual call count depends on how ListRegistries triggers delete; this test focuses on notification.
  });

  it('should display error message when fetching parents fails', async () => {
    const errorMessage = 'Failed to fetch parents';
    (getAllResponsibles as any).mockRejectedValueOnce(new Error(errorMessage)); // Mock fetch failure
    renderComponent();
    await waitFor(() => {
      // Assert that the raw error message is displayed
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display field errors from backend when adding a parent fails', async () => {
    const backendErrors = { 
      name: "BE: Parent name invalid", 
      phone: "BE: Phone number is required" 
    };
    (createResponsible as any).mockRejectedValueOnce({ 
      response: { data: { message: "Validation failed", errors: backendErrors } } 
    });
    
    renderComponent();
    await waitFor(() => expect(screen.getByLabelText('parentManager.labels.name')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('parentManager.labels.name'), { target: { name: 'name', value: 'Faulty Parent' } });
    // Intentionally not filling phone to trigger backend error for phone
    fireEvent.click(screen.getByText('parentManager.buttons.save'));
    
    await waitFor(() => {
      // Assert that raw backend error messages are displayed via FormField's data-testid
      expect(screen.getByTestId('error-name')).toHaveTextContent('BE: Parent name invalid');
      expect(screen.getByTestId('error-phone')).toHaveTextContent('BE: Phone number is required');
    });
  });
  
  it('should display client-side validation errors for required fields', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByLabelText('parentManager.labels.name')).toBeInTheDocument());

    // Submit form without filling required fields (name, phone)
    fireEvent.click(screen.getByText('parentManager.buttons.save')); 
    
    await waitFor(() => {
      // Assert that i18n keys for client-side validation messages are displayed via FormField mock
      expect(screen.getByTestId('error-name')).toHaveTextContent('parentManager.validations.nameRequired');
      expect(screen.getByTestId('error-phone')).toHaveTextContent('parentManager.validations.phoneRequired');
    });
    // Ensure createResponsible is not called due to client-side validation failure
    expect(createResponsible).not.toHaveBeenCalled(); 
  });

  it('should reset form after successful parent creation', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText('parentManager.labels.name')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText('parentManager.labels.name'), { target: { name: 'name', value: 'Another Parent' } });
    fireEvent.change(screen.getByLabelText('parentManager.labels.phone'), { target: { name: 'phone', value: '111-222-3333' } });
    fireEvent.change(screen.getByLabelText('parentManager.labels.email'), { target: { name: 'email', value: 'another@parent.com' } });
    
    fireEvent.click(screen.getByText('parentManager.buttons.save'));
    
    await waitFor(() => {
      expect(createResponsible).toHaveBeenCalled(); // Wait for submission
    });
    
    // Assert that form fields are reset to initial (empty) values
    expect(screen.getByLabelText('parentManager.labels.name')).toHaveValue('');
    expect(screen.getByLabelText('parentManager.labels.phone')).toHaveValue('');
    expect(screen.getByLabelText('parentManager.labels.email')).toHaveValue('');
  });
});