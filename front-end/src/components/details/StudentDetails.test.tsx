import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentDetails from './StudentDetails';
import { getStudentById } from '../../features/students/services/StudentService';
import { getAllClassRooms } from '../../features/classes/services/ClassService';
import { enrollStudent, getStudentEnrollments } from '../../features/enrollments/services/EnrollmentService';
import notification from '../common/Notification';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
  };
});

vi.mock('../../features/students/services/StudentService', () => ({
  getStudentById: vi.fn(),
}));

vi.mock('../../features/classes/services/ClassService', () => ({
  getAllClassRooms: vi.fn(),
}));

vi.mock('../../features/enrollments/services/EnrollmentService', () => ({
  getStudentEnrollments: vi.fn(),
  enrollStudent: vi.fn(),
}));

vi.mock('../common/Notification', () => ({
  default: vi.fn(),
}));

describe('StudentDetails Component', () => {
  const mockStudent = {
    id: '123',
    name: 'John Doe',
    responsibleId: '456',
    responsibleName: 'Jane Doe',
  };

  const mockClasses = {
    content: [
      { id: 'class1', name: 'Class A' },
      { id: 'class2', name: 'Class B' },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getStudentById as any).mockResolvedValue(mockStudent);
    (getAllClassRooms as any).mockResolvedValue(mockClasses);
  });

  it('should render loading state initially', () => {
    render(
      <MemoryRouter>
        <StudentDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render student details when data is loaded', async () => {
    (getStudentEnrollments as any).mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <StudentDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Student Details')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Name: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('This student is not currently enrolled in any class.')).toBeInTheDocument();
  });

  it('should render enrollment form when student has no enrollments', async () => {
    (getStudentEnrollments as any).mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <StudentDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Select a Class')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Enrollment Fee')).toBeInTheDocument();
    expect(screen.getByText('Monthly Fee')).toBeInTheDocument();
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });

  it('should render current enrollment when student is enrolled', async () => {
    const mockEnrollment = {
      id: 'enroll1',
      classRoomName: 'Class A',
      enrollmentDate: '01-01-2023',
      endDate: null,
    };
    
    (getStudentEnrollments as any).mockResolvedValue([mockEnrollment]);
    
    render(
      <MemoryRouter>
        <StudentDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Current Enrollment')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Current Class: Class A')).toBeInTheDocument();
    expect(screen.getByText('Enrollment Date: 01/01/2023')).toBeInTheDocument();
    expect(screen.getByText('End Date: No end date')).toBeInTheDocument();
    expect(screen.getByText('Cancel Enrollment')).toBeInTheDocument();
  });

  it('should handle enrollment when form is submitted', async () => {
    (getStudentEnrollments as any).mockResolvedValue([]);
    (enrollStudent as any).mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <StudentDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Enroll')).toBeInTheDocument();
    });
    
    // Select a class
    fireEvent.change(screen.getByLabelText('Select a Class'), {
      target: { value: 'class1' },
    });
    
    // Enter fees
    fireEvent.change(screen.getByLabelText('Enrollment Fee'), {
      target: { value: '100' },
    });
    
    fireEvent.change(screen.getByLabelText('Monthly Fee'), {
      target: { value: '50' },
    });
    
    // Click enroll button
    fireEvent.click(screen.getByText('Enroll'));
    
    await waitFor(() => {
      expect(enrollStudent).toHaveBeenCalledWith({
        studentId: '123',
        classRoomId: 'class1',
        enrollmentFee: 100,
        monthyFee: 50,
      });
    });
    
    expect(notification).toHaveBeenCalledWith('Student successfully enrolled or updated!');
  });

  it('should show error message when enrollment fails', async () => {
    (getStudentEnrollments as any).mockResolvedValue([]);
    (enrollStudent as any).mockRejectedValue(new Error('Enrollment failed'));
    
    render(
      <MemoryRouter>
        <StudentDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Enroll')).toBeInTheDocument();
    });
    
    // Select a class
    fireEvent.change(screen.getByLabelText('Select a Class'), {
      target: { value: 'class1' },
    });
    
    // Click enroll button
    fireEvent.click(screen.getByText('Enroll'));
    
    await waitFor(() => {
      expect(screen.getByText('Enrollment failed')).toBeInTheDocument();
    });
  });
});