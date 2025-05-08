import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ParentDetails from './ParentDetails';
import { useParentDetails } from '../../features/parents/components/useParentDetails';
import { getPaymentsByResponsible, processPayment } from '../../features/payments/services/PaymentService';
import { PaymentMethod } from '../../features/payments/types/PaymentTypes';
import notification from '../common/Notification';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'parent123' }),
  };
});

vi.mock('../../features/parents/components/useParentDetails', () => ({
  useParentDetails: vi.fn(),
}));

vi.mock('../../features/payments/services/PaymentService', () => ({
  getPaymentsByResponsible: vi.fn(),
  processPayment: vi.fn(),
}));

vi.mock('../common/Notification', () => ({
  default: vi.fn(),
}));

vi.mock('react-modal', () => {
  return {
    default: ({ children, isOpen }) => isOpen ? <div data-testid="modal">{children}</div> : null,
    setAppElement: vi.fn(),
  };
});

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

  const mockMonthlyFees = [];

  const mockPayments = [
    {
      id: 'payment1',
      paymentDate: new Date('2023-05-15'),
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
      invoiceId: 'invoice1',
    },
    {
      id: 'payment2',
      paymentDate: new Date('2023-06-15'),
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
      invoiceId: 'invoice2',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (useParentDetails as any).mockReturnValue({
      parent: mockParent,
      students: mockStudents,
      monthlyFees: mockMonthlyFees,
      error: null,
    });
    (getPaymentsByResponsible as any).mockResolvedValue(mockPayments);
    (processPayment as any).mockResolvedValue({});
  });

  it('should render loading spinner when parent data is not available', () => {
    (useParentDetails as any).mockReturnValue({
      parent: null,
      students: [],
      monthlyFees: [],
      error: null,
    });

    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error message when there is an error', () => {
    (useParentDetails as any).mockReturnValue({
      parent: null,
      students: [],
      monthlyFees: [],
      error: 'Failed to fetch parent data',
    });

    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Failed to fetch parent data')).toBeInTheDocument();
  });

  it('should render parent details when data is loaded', async () => {
    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Responsável')).toBeInTheDocument();
    expect(screen.getByText('Name: John Parent')).toBeInTheDocument();
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Phone: 123-456-7890')).toBeInTheDocument();
  });

  it('should render student list', async () => {
    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Alice Student')).toBeInTheDocument();
    expect(screen.getByText('Bob Student')).toBeInTheDocument();
  });

  it('should render payments grouped by month', async () => {
    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Payments')).toBeInTheDocument();
    
    // Since the payments are grouped by month, we should see the month names
    // The exact format depends on the locale, but we can check for parts of the date
    expect(screen.getByText(/maio.*2023/i)).toBeInTheDocument(); // May 2023
    expect(screen.getByText(/junho.*2023/i)).toBeInTheDocument(); // June 2023
    
    // Check for payment details
    expect(screen.getAllByText('R$ 100')).toHaveLength(2);
    expect(screen.getAllByText(PaymentMethod.PIX)).toHaveLength(2);
  });

  it('should handle marking a month as paid', async () => {
    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    // Find the "Pagar" button for the first month
    const payButtons = screen.getAllByText(/Pagar/);
    fireEvent.click(payButtons[0]);
    
    await waitFor(() => {
      expect(processPayment).toHaveBeenCalled();
    });
    
    // Should refresh payments after processing
    expect(getPaymentsByResponsible).toHaveBeenCalledTimes(2);
    
    // Should show notification
    expect(notification).toHaveBeenCalledWith('Pagamentos do mês atualizados com sucesso!', 'success');
  });

  it('should handle error when marking a month as paid fails', async () => {
    (processPayment as any).mockRejectedValue(new Error('Payment processing failed'));
    
    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    // Find the "Pagar" button for the first month
    const payButtons = screen.getAllByText(/Pagar/);
    fireEvent.click(payButtons[0]);
    
    await waitFor(() => {
      expect(processPayment).toHaveBeenCalled();
    });
    
    // Should show error notification
    expect(notification).toHaveBeenCalledWith('Payment processing failed', 'error');
  });

  it('should open student form modal when "Adicionar Aluno" button is clicked', () => {
    render(
      <MemoryRouter>
        <ParentDetails />
      </MemoryRouter>
    );
    
    const addStudentButton = screen.getByText('Adicionar Aluno');
    fireEvent.click(addStudentButton);
    
    // Modal should be open
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });
});