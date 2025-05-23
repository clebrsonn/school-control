import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';
import { describe, expect } from 'vitest';

describe('ErrorMessage', () => {
  it('deve exibir a mensagem de erro', () => {
    render(<ErrorMessage message="Erro de teste" />);
    expect(screen.getByText('Erro de teste')).toBeInTheDocument();
  });

  it('não deve renderizar nada se não houver mensagem', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});

