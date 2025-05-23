import { screen } from '@testing-library/react';
import Notification from './Notification';
import { describe, expect } from 'vitest';

describe('Notification', () => {
  it('deve exibir a notificação de sucesso', () => {
    Notification('Mensagem de sucesso', 'success');
    expect(screen.getByText('Mensagem de sucesso')).toBeInTheDocument();
  });

  it('deve exibir a notificação de erro', () => {
    Notification('Mensagem de erro', 'error');
    expect(screen.getByText('Mensagem de erro')).toBeInTheDocument();
  });

  it('deve exibir a notificação de info', () => {
    Notification('Mensagem de info', 'info');
    expect(screen.getByText('Mensagem de info')).toBeInTheDocument();
  });
});

