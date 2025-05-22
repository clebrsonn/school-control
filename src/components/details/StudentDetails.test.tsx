import React, { Suspense } from 'react'; // Added Suspense
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom'; // useParams needed for mocking
import StudentDetails from './StudentDetails';
import { getStudentById } from '../../features/students/services/StudentService';
import { getAllClassRooms } from '../../features/classes/services/ClassService';
import { 
    enrollStudent, 
    getStudentEnrollments, 
    cancelEnrollment, 
    renewEnrollment 
} from '../../features/enrollments/services/EnrollmentService';
import notification from '../common/Notification';
import { EnrollmentResponse } from '../../features/enrollments/types/EnrollmentTypes.ts'; // For mock data
import { StudentResponse } from '../../features/students/types/StudentTypes.ts'; // For mock data
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes.ts'; // For mock data

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Simple mock: returns the key
    i18n: { language: 'en-US' }, // Mock i18n instance for date formatting
  }),
}));

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(), // Mock specific function
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
  cancelEnrollment: vi.fn(),
  renewEnrollment: vi.fn(),
}));

vi.mock('../common/Notification', () => ({
  default: vi.fn(),
}));

// Mock LoadingSpinner and ErrorMessage
vi.mock('../common/LoadingSpinner', () => ({
    LoadingSpinner: ({ message }: { message?: string }) => <div data-testid="loading-spinner">{message || 'Loading...'}</div>,
}));
vi.mock('../common/ErrorMessage', () => ({
    default: ({ message }: { message: string }) => <div data-testid="error-message">{message}</div>,
}));


describe('StudentDetails Component', () => {
  const mockStudent: StudentResponse = { // Typed mock data
    id: '123',
    name: 'John Doe',
    responsibleId: '456',
    responsibleName: 'Jane Doe',
    email: 'john.doe@example.com', // Added email as it might be displayed
    // Add other fields from StudentResponse as needed by component
  };

  const mockClassesData: { content: ClassRoomResponse[] } = { // Typed mock data
    content: [
      { id: 'class1', name: 'Class A', schoolYear: '2023', startTime: '08:00', endTime: '12:00' },
      { id: 'class2', name: 'Class B', schoolYear: '2023', startTime: '13:00', endTime: '17:00' },
    ],
  };
  
  const mockEnrollments: EnrollmentResponse[] = []; // Default to no enrollments

  const renderComponentWithRouter = () => {
    // Wrap with Suspense for lazy loaded icons
    return render(
      <MemoryRouter>
        <Suspense fallback={<div data-testid="suspense-fallback">Loading Icons...</div>}>
          <StudentDetails />
        </Suspense>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useParams as any).mockReturnValue({ id: '123' });
    (getStudentById as any).mockResolvedValue(mockStudent);
    (getAllClassRooms as any).mockResolvedValue(mockClassesData);
    (getStudentEnrollments as any).mockResolvedValue(mockEnrollments); // Default empty enrollments
    (enrollStudent as any).mockResolvedValue({});
    (cancelEnrollment as any).mockResolvedValue({});
    (renewEnrollment as any).mockResolvedValue({});
    if (notification && (notification as any).mockClear) {
        (notification as any).mockClear();
    }
  });

  it('should render loading state initially for student data', async () => {
    (getStudentById as any).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(mockStudent), 100)));
    renderComponentWithRouter();
    expect(screen.getByTestId('loading-spinner')).toHaveTextContent('studentDetails.loading.studentData');
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
  });

  it('should render student details when data is loaded', async () => {
    renderComponentWithRouter();
    await waitFor(() => {
      expect(screen.getByText('studentDetails.title')).toBeInTheDocument();
    });
    expect(screen.getByText('studentDetails.labels.name')).toBeInTheDocument();
    expect(screen.getByText(mockStudent.name)).toBeInTheDocument();
    expect(screen.getByText('studentDetails.labels.responsible')).toBeInTheDocument();
    expect(screen.getByText(mockStudent.responsibleName!)).toBeInTheDocument(); // Assuming responsibleName is always present
  });

  it('should render enrollment form when student has no enrollments', async () => {
    renderComponentWithRouter(); // enrollments is empty by default beforeEach
    await waitFor(() => {
      expect(screen.getByText('studentDetails.noEnrollmentMessage')).toBeInTheDocument();
    });
    expect(screen.getByText('studentDetails.newEnrollmentTitle')).toBeInTheDocument();
    expect(screen.getByLabelText('studentDetails.enrollmentForm.selectClassLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('studentDetails.enrollmentForm.enrollmentFeeLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('studentDetails.enrollmentForm.monthlyFeeLabel')).toBeInTheDocument();
    expect(screen.getByText('studentDetails.buttons.enroll')).toBeInTheDocument();
  });

  it('should render current enrollment when student is enrolled', async () => {
    const activeEnrollment: EnrollmentResponse = {
      id: 'enroll1',
      studentId: '123',
      classRoomId: 'class1',
      classRoomName: 'Class A',
      enrollmentDate: '2023-01-15T00:00:00Z', // ISO string
      endDate: null, // Active enrollment
      status: 'ACTIVE',
    };
    (getStudentEnrollments as any).mockResolvedValue([activeEnrollment]);
    renderComponentWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('studentDetails.currentEnrollmentTitle')).toBeInTheDocument();
    });
    
    expect(screen.getByText('studentDetails.labels.currentClass')).toBeInTheDocument();
    expect(screen.getByText(activeEnrollment.classRoomName!)).toBeInTheDocument();
    expect(screen.getByText('studentDetails.labels.enrollmentDate')).toBeInTheDocument();
    // Date formatting depends on i18n.language, e.g., 'en-US' gives '1/15/2023'
    expect(screen.getByText(new Date(activeEnrollment.enrollmentDate).toLocaleDateString('en-US'))).toBeInTheDocument(); 
    expect(screen.getByText('studentDetails.labels.endDate')).toBeInTheDocument();
    expect(screen.getByText('studentDetails.noEndDate')).toBeInTheDocument(); // For null endDate
    expect(screen.getByText('studentDetails.buttons.cancelEnrollment')).toBeInTheDocument();
    // Change class form should also be visible
    expect(screen.getByText('studentDetails.changeClassTitle')).toBeInTheDocument();
  });

  it('should handle enrollment when form is submitted', async () => {
    renderComponentWithRouter(); // No initial enrollments
    await waitFor(() => { // Wait for form to be ready
      expect(screen.getByText('studentDetails.buttons.enroll')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText('studentDetails.enrollmentForm.selectClassLabel'), { target: { value: 'class1' } });
    fireEvent.change(screen.getByLabelText('studentDetails.enrollmentForm.enrollmentFeeLabel'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('studentDetails.enrollmentForm.monthlyFeeLabel'), { target: { value: '50' } });
    
    fireEvent.click(screen.getByText('studentDetails.buttons.enroll'));
    
    await waitFor(() => {
      expect(enrollStudent).toHaveBeenCalledWith({
        studentId: '123',
        classRoomId: 'class1',
        enrollmentFee: 100,
        monthyFee: 50, // Assuming this key from original component
      });
      expect(notification).toHaveBeenCalledWith('studentDetails.notifications.enrollmentSuccess', 'success');
    });
    expect(getStudentEnrollments).toHaveBeenCalledTimes(2); // Initial + refetch
  });

  it('should show error notification when enrollment fails (e.g. no class selected)', async () => {
    renderComponentWithRouter();
    await waitFor(() => {
      expect(screen.getByText('studentDetails.buttons.enroll')).toBeInTheDocument();
    });
        
    fireEvent.click(screen.getByText('studentDetails.buttons.enroll')); // No class selected
    
    await waitFor(() => {
      expect(notification).toHaveBeenCalledWith('studentDetails.notifications.enrollmentSelectClassError', 'error');
    });
    expect(enrollStudent).not.toHaveBeenCalled();
  });
  
  it('should show error notification when enrollStudent service call fails', async () => {
    const enrollErrorMsg = 'API enrollment failed';
    (enrollStudent as any).mockRejectedValueOnce(new Error(enrollErrorMsg));
    renderComponentWithRouter();
    await waitFor(() => {
      expect(screen.getByText('studentDetails.buttons.enroll')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText('studentDetails.enrollmentForm.selectClassLabel'), { target: { value: 'class1' } });
    fireEvent.click(screen.getByText('studentDetails.buttons.enroll'));
    
    await waitFor(() => {
      expect(notification).toHaveBeenCalledWith(enrollErrorMsg, 'error');
    });
  });

  // Add tests for cancelEnrollment and renewEnrollment similarly
  // Test for display of "Renew" button when enrollment has ended.
  // Test for error states from API calls (getStudentById, getAllClassrooms, getStudentEnrollments).
});