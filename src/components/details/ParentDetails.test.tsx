import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom'; // useParams needed for mocking
import ParentDetails from './ParentDetails';
import { useParentDetails } from '../../features/parents/components/useParentDetails';
import { getPaymentsByResponsible, processPayment } from '../../features/payments/services/PaymentService';
import { getConsolidatedStatement } from '../../features/billing/services/BillingService'; // Added
import { PaymentMethod } from '../../features/payments/types/PaymentTypes';
import notification from '../common/Notification';
import { ConsolidatedStatement, StatementLineItem } from '../../features/billing/types/BillingTypes'; // Added

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
        if (options && options.val) return `${key} ${options.val}`; // For "Total: R$ AMOUNT"
        return key;
    },
    i18n: { language: 'pt-BR' }, // Mock i18n instance
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

vi.mock('../../features/parents/components/useParentDetails', () => ({
  useParentDetails: vi.fn(),
}));

vi.mock('../../features/payments/services/PaymentService', () => ({
  getPaymentsByResponsible: vi.fn(),
  processPayment: vi.fn(),
}));
vi.mock('../../features/billing/services/BillingService', () => ({ // Added mock for billing service
    getConsolidatedStatement: vi.fn(),
}));

vi.mock('../common/Notification', () => ({
  default: vi.fn(),
}));

// Mock react-modal specifically for this test file
vi.mock('react-modal', () => {
    const Modal = ({ children, isOpen }: { children: React.ReactNode, isOpen: boolean }) => {
        if (!isOpen) return null;
        return <div data-testid="modal">{children}</div>;
    };
    Modal.setAppElement = vi.fn(); // Mock setAppElement
    return { default: Modal };
});

// Mock LoadingSpinner
vi.mock('../common/LoadingSpinner', () => ({
    LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));
// Mock StudentManager as it's complex and not the focus here
vi.mock('../managers/StudentManager', () => ({
    default: ({responsible}: {responsible: string}) => <div data-testid="student-manager-mock">StudentManager for {responsible}</div>
}));


describe('ParentDetails Component', () => {
  const mockParent = {
    id: 'parent123',
    name: 'John Parent',
    email: 'john@example.com',
    phone: '123-456-7890',
  };

  const mockStudents = [
    { id: 'student1', name: 'Alice Student' },
    { id: 'student2', name: 'Bob Student' },
  ];

  const mockPayments = [
    {
      id: 'payment1',
      paymentDate: new Date('2023-05-15T00:00:00.000Z'), // Use ISO string for consistency
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
      invoiceId: 'invoice1',
    },
    {
      id: 'payment2',
      paymentDate: new Date('2023-06-15T00:00:00.000Z'),
      amount: 120,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      invoiceId: 'invoice2',
    },
  ];
  
  const mockConsolidatedStatement: ConsolidatedStatement = {
      responsibleId: 'parent123',
      responsibleName: 'John Parent',
      totalAmountDue: 75.50,
      items: [
          { invoiceId: 'inv3', studentName: 'Alice Student', description: 'Curso de Inglês', amount: 75.50, dueDate: '2023-11-10', status: 'PENDING' }
      ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useParams as any).mockReturnValue({ id: 'parent123' });
    (useParentDetails as any).mockReturnValue({
      parent: mockParent,
      students: mockStudents,
      error: null,
    });
    (getPaymentsByResponsible as any).mockResolvedValue(mockPayments);
    (getConsolidatedStatement as any).mockResolvedValue(mockConsolidatedStatement);
    (processPayment as any).mockResolvedValue({});
    if (notification && (notification as any).mockClear) {
        (notification as any).mockClear();
    }
    // Ensure Modal.setAppElement is mocked if it's called by the library
    if (Modal && Modal.setAppElement) {
        Modal.setAppElement(document.createElement('div'));
    }
  });

  const renderComponent = () => {
      render(
        <MemoryRouter> {/* Needed for Link components */}
          <ParentDetails />
        </MemoryRouter>
      );
  };

  it('should render loading spinner when parent data is not available', () => {
    (useParentDetails as any).mockReturnValue({ parent: null, students: [], error: null });
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render error message when there is an error from useParentDetails', () => {
    const errorMessage = 'Failed to fetch parent data';
    (useParentDetails as any).mockReturnValue({ parent: null, students: [], error: { message: errorMessage } });
    renderComponent();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render parent details when data is loaded', async () => {
    renderComponent();
    await waitFor(() => {
        expect(screen.getByText('parentDetails.title')).toBeInTheDocument();
    });
    expect(screen.getByText('parentDetails.personalInfoTitle')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.labels.name')).toBeInTheDocument();
    expect(screen.getByText(mockParent.name)).toBeInTheDocument();
    expect(screen.getByText('parentDetails.labels.email')).toBeInTheDocument();
    expect(screen.getByText(mockParent.email)).toBeInTheDocument();
    expect(screen.getByText('parentDetails.labels.phone')).toBeInTheDocument();
    expect(screen.getByText(mockParent.phone)).toBeInTheDocument();
  });

  it('should render student list and "Add Student" button', async () => {
    renderComponent();
    await waitFor(() => {
        expect(screen.getByText('parentDetails.studentsTitle')).toBeInTheDocument();
    });
    expect(screen.getByText('Alice Student')).toBeInTheDocument();
    expect(screen.getByText('Bob Student')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.buttons.addStudent')).toBeInTheDocument();
    expect(screen.getAllByText('parentDetails.buttons.viewDetails').length).toBeGreaterThan(0);
  });

  it('should render realized payments grouped by month with i18n keys', async () => {
    renderComponent();
    await waitFor(() => {
        expect(screen.getByText('parentDetails.realizedPaymentsTitle')).toBeInTheDocument();
    });
    // Check for month (format depends on i18n.language, 'pt-BR' gives 'maio de 2023', 'junho de 2023')
    expect(screen.getByText(/maio de 2023/i)).toBeInTheDocument(); 
    expect(screen.getByText(/junho de 2023/i)).toBeInTheDocument(); 
    
    expect(screen.getByText('parentDetails.table.paymentDate')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.table.value')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.table.method')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.table.invoiceId')).toBeInTheDocument();
    
    expect(screen.getByText(PaymentMethod.PIX)).toBeInTheDocument();
    expect(screen.getByText(PaymentMethod.CREDIT_CARD)).toBeInTheDocument();
  });
  
  it('should render pending payments section with i18n keys', async () => {
    renderComponent();
    await waitFor(() => {
        expect(screen.getByText('parentDetails.pendingPaymentsTitle')).toBeInTheDocument();
    });
    expect(screen.getByText('parentDetails.totalOpenPayments R$ 75,50')).toBeInTheDocument(); // Example, depends on locale
    expect(screen.getByText('parentDetails.table.student')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.table.description')).toBeInTheDocument();
    // Value and Due Date are in table, already covered by table.value and table.dueDate
    expect(screen.getByText('parentDetails.table.status')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.table.actions')).toBeInTheDocument();
    expect(screen.getByText(mockConsolidatedStatement.items[0].studentName)).toBeInTheDocument();
    expect(screen.getByText('parentDetails.statusPending')).toBeInTheDocument();
    expect(screen.getByText('parentDetails.buttons.pay')).toBeInTheDocument();
  });


  it('should handle processing a pending payment', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('parentDetails.buttons.pay')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('parentDetails.buttons.pay'));
    
    await waitFor(() => {
      expect(processPayment).toHaveBeenCalledWith({
        invoiceId: mockConsolidatedStatement.items[0].invoiceId,
        amount: mockConsolidatedStatement.items[0].amount,
        paymentMethod: PaymentMethod.PIX,
        paymentDate: expect.any(Date)
      });
      expect(notification).toHaveBeenCalledWith('parentDetails.notifications.paymentSuccess', 'success');
      // Check for refetch calls
      expect(getConsolidatedStatement).toHaveBeenCalledTimes(2); // Initial + refetch
      expect(getPaymentsByResponsible).toHaveBeenCalledTimes(2); // Initial + refetch
    });
  });

  it('should handle error when processing payment fails', async () => {
    const paymentErrorMessage = 'Payment processing failed badly';
    (processPayment as any).mockRejectedValueOnce(new Error(paymentErrorMessage));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('parentDetails.buttons.pay')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('parentDetails.buttons.pay'));
    
    await waitFor(() => {
      expect(notification).toHaveBeenCalledWith(paymentErrorMessage, 'error');
    });
  });

  it('should open student form modal when "Add Student" button is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('parentDetails.buttons.addStudent')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('parentDetails.buttons.addStudent'));
    
    await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('student-manager-mock')).toHaveTextContent('StudentManager for parent123');
    });
  });
  
  it('should display "no students" message if student list is empty', async () => {
    (useParentDetails as any).mockReturnValue({ parent: mockParent, students: [], error: null });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('parentDetails.noStudentsRegistered')).toBeInTheDocument();
    });
  });

  it('should display "no realized payments" message if payments list is empty', async () => {
    (getPaymentsByResponsible as any).mockResolvedValue([]);
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('parentDetails.noPaymentsRegistered')).toBeInTheDocument();
    });
  });

  it('should display "no pending payments" message if consolidated statement is null or has no items', async () => {
    (getConsolidatedStatement as any).mockResolvedValue(null);
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('parentDetails.noPendingPayments')).toBeInTheDocument();
    });

    (getConsolidatedStatement as any).mockResolvedValue({ ...mockConsolidatedStatement, items: [] });
    // Need to force a re-render or new render to see change
    render(
        <MemoryRouter>
          <ParentDetails />
        </MemoryRouter>
      );
     await waitFor(() => {
      expect(screen.getByText('parentDetails.noPendingPayments')).toBeInTheDocument();
    });
  });

});