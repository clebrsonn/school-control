import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DiscountManager from './DiscountManager';
import { createDiscount, deleteDiscount, fetchDiscounts } from '../../features/enrollments/services/DiscountService';

// Mock the dependencies
vi.mock('../../features/enrollments/services/DiscountService', () => ({
  fetchDiscounts: vi.fn(),
  createDiscount: vi.fn(),
  deleteDiscount: vi.fn()
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

describe('DiscountManager Component', () => {
  const mockDiscounts = {
    content: [
      { id: 'discount1', name: 'Early Bird', value: 50, validUntil: '2023-12-31', type: 'enroll' },
      { id: 'discount2', name: 'Sibling Discount', value: 25, validUntil: '2023-12-31', type: 'tuition' }
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
    (fetchDiscounts as any).mockResolvedValue(mockDiscounts);
  });

  it('should render the component with title', async () => {
    render(<DiscountManager />);
    
    expect(screen.getByText('Gerenciamento de Descontos')).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchDiscounts).toHaveBeenCalledWith(0, 10);
    });
  });

  it('should display discount form fields', () => {
    render(<DiscountManager />);
    
    expect(screen.getByLabelText('Nome do Desconto')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor do Desconto')).toBeInTheDocument();
    expect(screen.getByLabelText('Validade do Desconto')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Desconto')).toBeInTheDocument();
    expect(screen.getByText('Adicionar Desconto')).toBeInTheDocument();
  });

  it('should handle adding a new discount', async () => {
    render(<DiscountManager />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome do Desconto'), {
      target: { value: 'New Discount' }
    });
    
    fireEvent.change(screen.getByLabelText('Valor do Desconto'), {
      target: { value: '30' }
    });
    
    fireEvent.change(screen.getByLabelText('Validade do Desconto'), {
      target: { value: '2023-12-31' }
    });
    
    fireEvent.change(screen.getByLabelText('Tipo de Desconto'), {
      target: { value: 'tuition' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Adicionar Desconto'));
    
    await waitFor(() => {
      expect(createDiscount).toHaveBeenCalledWith({
        name: 'New Discount',
        value: 30,
        validUntil: '2023-12-31',
        type: 'tuition'
      });
    });
    
    // Should refresh the discount list
    expect(fetchDiscounts).toHaveBeenCalledTimes(2);
  });

  it('should validate form fields before submission', async () => {
    render(<DiscountManager />);
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByText('Adicionar Desconto'));
    
    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos corretamente.')).toBeInTheDocument();
    });
    
    // createDiscount should not be called
    expect(createDiscount).not.toHaveBeenCalled();
  });

  it('should handle deleting a discount', async () => {
    // Mock the ListRegistries component by rendering the discounts directly
    (fetchDiscounts as any).mockResolvedValueOnce(mockDiscounts);
    
    const { container } = render(<DiscountManager />);
    
    await waitFor(() => {
      expect(fetchDiscounts).toHaveBeenCalled();
    });
    
    // Since ListRegistries is mocked and we can't directly test its onDelete callback,
    // we'll test the handleDelete function by simulating its behavior
    const instance = container.querySelector('button[aria-label="Delete discounts"]');
    
    // If the delete button is found, click it
    if (instance) {
      fireEvent.click(instance);
      
      await waitFor(() => {
        expect(deleteDiscount).toHaveBeenCalled();
      });
    } else {
      // If the button isn't found, we'll test the function directly
      const mockId = 'discount1';
      (deleteDiscount as any).mockResolvedValueOnce({});
      
      // Call the handleDelete function directly
      await (DiscountManager as any).prototype.handleDelete(mockId);
      
      expect(deleteDiscount).toHaveBeenCalledWith(mockId);
    }
  });

  it('should display error message when fetching discounts fails', async () => {
    (fetchDiscounts as any).mockRejectedValueOnce(new Error('Erro ao carregar os descontos.'));
    
    render(<DiscountManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar os descontos.')).toBeInTheDocument();
    });
  });

  it('should display error message when adding a discount fails', async () => {
    (createDiscount as any).mockRejectedValueOnce(new Error('Erro ao criar o desconto.'));
    
    render(<DiscountManager />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome do Desconto'), {
      target: { value: 'New Discount' }
    });
    
    fireEvent.change(screen.getByLabelText('Valor do Desconto'), {
      target: { value: '30' }
    });
    
    fireEvent.change(screen.getByLabelText('Validade do Desconto'), {
      target: { value: '2023-12-31' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Adicionar Desconto'));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao criar o desconto.')).toBeInTheDocument();
    });
  });

  it('should display success message after adding a discount', async () => {
    render(<DiscountManager />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Nome do Desconto'), {
      target: { value: 'New Discount' }
    });
    
    fireEvent.change(screen.getByLabelText('Valor do Desconto'), {
      target: { value: '30' }
    });
    
    fireEvent.change(screen.getByLabelText('Validade do Desconto'), {
      target: { value: '2023-12-31' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Adicionar Desconto'));
    
    await waitFor(() => {
      expect(screen.getByText('Desconto criado com sucesso!')).toBeInTheDocument();
    });
  });
});