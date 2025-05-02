import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentManager from './PaymentManager';

// Mock the dependencies
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

// Note: The PaymentManager component has commented-out code for API calls
// We're not mocking those services since they're not being used in the component

describe('PaymentManager Component', () => {
  const mockPayments = {
    content: [
      {
        year: 2023,
        month: 'January',
        responsible: { id: 'resp1', name: 'John Doe' },
        totalAmount: 500,
        payments: [
          { id: 'payment1', amount: 300, dueDate: '2023-01-15', status: 'PAID' },
          { id: 'payment2', amount: 200, dueDate: '2023-01-30', status: 'PENDING' }
        ]
      },
      {
        year: 2023,
        month: 'February',
        responsible: { id: 'resp1', name: 'John Doe' },
        totalAmount: 500,
        payments: [
          { id: 'payment3', amount: 500, dueDate: '2023-02-15', status: 'PENDING' }
        ]
      }
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
  });

  it('should render the component with title', () => {
    render(<PaymentManager />);
    
    expect(screen.getByText('Gerenciar Pagamentos')).toBeInTheDocument();
  });

  it('should display payments when data is available', async () => {
    // Mock the state update to include payment data
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [mockPayments, vi.fn()]);
    
    render(<PaymentManager />);
    
    // Check for payment group headers
    expect(screen.getByText('January/2023 - John Doe')).toBeInTheDocument();
    expect(screen.getByText('February/2023 - John Doe')).toBeInTheDocument();
    
    // Check for total amounts
    expect(screen.getAllByText('Total Amount: 500')).toHaveLength(2);
    
    // Check for individual payments
    expect(screen.getByText('300 - 1/15/2023 - PAID')).toBeInTheDocument();
    expect(screen.getByText('200 - 1/30/2023 - PENDING')).toBeInTheDocument();
    expect(screen.getByText('500 - 2/15/2023 - PENDING')).toBeInTheDocument();
  });

  it('should display pagination when there are multiple pages', async () => {
    // Mock the state update to include payment data with multiple pages
    const multiPagePayments = {
      ...mockPayments,
      totalPages: 3,
      number: 1 // Current page is 1 (second page)
    };
    
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [multiPagePayments, vi.fn()]);
    
    render(<PaymentManager />);
    
    // Check for pagination controls
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Current page should be active
    const page2Button = screen.getByText('2');
    expect(page2Button.closest('.active')).not.toBeNull();
  });

  it('should display error message when there is an error', async () => {
    // Mock the state updates to include an error
    vi.spyOn(React, 'useState')
      .mockImplementationOnce(() => [mockPayments, vi.fn()]) // For paymentPage
      .mockImplementationOnce(() => ['Failed to fetch payments', vi.fn()]); // For error
    
    render(<PaymentManager />);
    
    expect(screen.getByText('Failed to fetch payments')).toBeInTheDocument();
  });

  it('should not display pagination when there is only one page', async () => {
    // Mock the state update to include payment data with only one page
    const singlePagePayments = {
      ...mockPayments,
      totalPages: 1
    };
    
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [singlePagePayments, vi.fn()]);
    
    render(<PaymentManager />);
    
    // Pagination should not be present
    const paginationElement = document.querySelector('.pagination');
    expect(paginationElement).toBeNull();
  });
});