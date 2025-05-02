import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ClassDetails from './ClassDetails';
import { getClassRoomById } from '../../features/classes/services/ClassService';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'class123' }),
  };
});

vi.mock('../../features/classes/services/ClassService', () => ({
  getClassRoomById: vi.fn(),
}));

describe('ClassDetails Component', () => {
  const mockClass = {
    id: 'class123',
    name: 'Math Class',
    enrollmentFee: 100,
    monthlyFee: 50,
    startTime: '08:00',
    endTime: '10:00',
    schoolYear: '2023'
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getClassRoomById as any).mockResolvedValue(mockClass);
  });

  it('should render loading state initially', () => {
    render(
      <MemoryRouter>
        <ClassDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render class details when data is loaded', async () => {
    render(
      <MemoryRouter>
        <ClassDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Class Details')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Class Name: Math Class')).toBeInTheDocument();
    expect(screen.getByText('Matrícula: 100')).toBeInTheDocument();
    expect(screen.getByText('Mensalidade: 50')).toBeInTheDocument();
    expect(screen.getByText('Start Time: 08:00')).toBeInTheDocument();
    expect(screen.getByText('End Time: 10:00')).toBeInTheDocument();
  });

  it('should call getClassRoomById with the correct ID', async () => {
    render(
      <MemoryRouter>
        <ClassDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(getClassRoomById).toHaveBeenCalledWith('class123');
    });
  });

  it('should handle error when fetching class data fails', async () => {
    // Mock the error case
    (getClassRoomById as any).mockRejectedValue(new Error('Failed to fetch class'));
    
    // Spy on console.error to verify it's called
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <ClassDetails />
      </MemoryRouter>
    );
    
    // The component should still show loading since the data fetch failed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(getClassRoomById).toHaveBeenCalled();
    });
    
    // Restore console.error
    consoleSpy.mockRestore();
  });
});