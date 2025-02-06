import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {Document} from "mongoose";

import {Link} from 'react-router-dom';

// Define as props do componente
interface EntityTableProps<T> {
    data: T[]; // Lista de dados genéricos
    entityName: string; // Nome da entidade (ex.: "responsável")
    onDelete?: (id: string) => void; // Função para exclusão (opcional)
}

const EntityTable = <T extends Document>({
                                                    data,
                                                    entityName,
                                                    onDelete,
                                                }: EntityTableProps<T>) => {
    // Obtemos as chaves das colunas automaticamente do primeiro item da lista
    const columns = data.length > 0 ? Object.keys(data[0]).filter((key) => key !== '_id' && key !== '__v') : [];

    return (
        <Table striped bordered hover responsive>
            <thead>
            <tr>
                {columns.map((column, index) => (
                    <th key={index}>{column}</th>
                ))}
                {onDelete && <th>Ações</th>} {/* Exibimos a coluna de "Ações" se o onDelete estiver definido */}
            </tr>
            </thead>
            <tbody>
            {data?.map((item) => (
                <tr key={item._id}>
                    {/* Itera sobre todas as propriedades do objeto com as chaves dinâmicas */}
                    {columns.map((column, index) => (
                        <td key={`${item._id}-${index}`}>
                            {column === 'name' ? ( // Caso a chave seja "name", adiciona link
                                <Link to={`/${entityName}s/${item._id}`}>
                                    {(item as Record<string, any>)[column]}
                                </Link>
                            ) : (
                                typeof (item as Record<string, any>)[column] === 'object' ?
                                    (Array.isArray((item as Record<string, any>)[column]) ?
                                        ((
                                            (item as Record<string, any>)[column]
                                        )?.map(o => o.name).join(", ") || '-'):
                                    ((item as Record<string, any>)[column]?.name || '-')) :
                                    (item as Record<string, any>)[column]
                            )}
                        </td>
                    ))}
                    {/* Adiciona a coluna de ações para excluir, se fornecido */}
                    {onDelete && (
                        <td>
                            <Button
                                variant="danger"
                                onClick={() => onDelete(item._id)}
                                size="sm"
                            >
                                Excluir
                            </Button>
                        </td>
                    )}
                </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length + (onDelete ? 1 : 0)} className="text-center">
                        Nenhum {entityName} encontrado.
                    </td>
                </tr>
            )}
            </tbody>
        </Table>
    );
};

export default EntityTable;