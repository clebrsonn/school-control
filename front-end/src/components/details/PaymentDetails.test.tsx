import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PaymentDetails from './PaymentDetails';
import { getPaymentById } from '../../features/payments/services/PaymentService';
import { PaymentMethod } from '../../features/payments/types/PaymentTypes';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'payment123' }),
  };
});

vi.mock('../../features/payments/services/PaymentService', () => ({
  getPaymentById: vi.fn(),
}));

describe('PaymentDetails Component', () => {
  const mockPayment = {
    id: 'payment123',
    amount: 150,
    paymentDate: new Date('2023-05-15'),
    invoiceId: 'invoice456',
    paymentMethod: PaymentMethod.PIX,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getPaymentById as any).mockResolvedValue(mockPayment);
  });

  it('should render loading state initially', () => {
    render(
      <MemoryRouter>
        <PaymentDetails />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render payment details when data is loaded', async () => {
    render(
      <MemoryRouter>
        <PaymentDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Payment Details')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Amount: 150')).toBeInTheDocument();
    expect(screen.getByText('Date: 15')).toBeInTheDocument(); // getDate() returns the day of the month
    expect(screen.getByText('Matrícula: invoice456')).toBeInTheDocument();
    expect(screen.getByText(`Status: ${PaymentMethod.PIX}`)).toBeInTheDocument();
  });

  it('should call getPaymentById with the correct ID', async () => {
    render(
      <MemoryRouter>
        <PaymentDetails />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(getPaymentById).toHaveBeenCalledWith('payment123');
    });
  });

  it('should handle error when fetching payment data fails', async () => {
    // Mock the error case
    (getPaymentById as any).mockRejectedValue(new Error('Failed to fetch payment'));
    
    // Spy on console.error to verify it's called
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <PaymentDetails />
      </MemoryRouter>
    );
    
    // The component should still show loading since the data fetch failed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(getPaymentById).toHaveBeenCalled();
    });
    
    // Restore console.error
    consoleSpy.mockRestore();
  });
});