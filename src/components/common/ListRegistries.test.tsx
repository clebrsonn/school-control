import { fireEvent, render, screen } from '@testing-library/react';
import ListRegistries from './ListRegistries';

describe('ListRegistries', () => {
  const pageMock = {
    content: [
      { id: '1', nome: 'Teste 1', ativo: true },
      { id: '2', nome: 'Teste 2', ativo: false }
    ],
    number: 0,
    totalPages: 2,
    size: 10
  };

  it('deve renderizar a lista de registros', () => {
    render(
      <ListRegistries page={pageMock} entityName="testes" />
    );
    expect(screen.getByText('Teste 1')).toBeInTheDocument();
    expect(screen.getByText('Teste 2')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não houver registros', () => {
    render(
      <ListRegistries page={{ ...pageMock, content: [] }} entityName="testes" />
    );
    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument();
  });

  it('deve filtrar registros pela busca', () => {
    render(
      <ListRegistries page={pageMock} entityName="testes" />
    );
    fireEvent.change(screen.getByPlaceholderText('Buscar testes...'), { target: { value: 'Teste 1' } });
    expect(screen.getByText('Teste 1')).toBeInTheDocument();
    expect(screen.queryByText('Teste 2')).not.toBeInTheDocument();
  });

  it('deve chamar onDelete ao clicar em Excluir', () => {
    const onDelete = jest.fn();
    render(
      <ListRegistries page={pageMock} entityName="testes" onDelete={onDelete} />
    );
    fireEvent.click(screen.getAllByLabelText('Excluir testes')[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('deve chamar onEdit ao clicar em Editar', () => {
    const onEdit = jest.fn();
    render(
      <ListRegistries page={pageMock} entityName="testes" onEdit={onEdit} />
    );
    fireEvent.click(screen.getAllByLabelText('Editar testes')[0]);
    expect(onEdit).toHaveBeenCalledWith(pageMock.content[0]);
  });

  it('deve chamar onPageChange ao trocar de página', () => {
    const onPageChange = jest.fn();
    render(
      <ListRegistries page={pageMock} entityName="testes" onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

