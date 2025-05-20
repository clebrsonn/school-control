import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface IEntity {
    _id: string;
    [key: string]: any;
}

interface EntityTableProps<T extends IEntity> {
    data: T[];
    entityName: string;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void; // Added onEdit prop
}

const EntityTable = <T extends IEntity>({ data, entityName, onDelete, onEdit }: EntityTableProps<T>) => { // Added onEdit to destructuring
    const columns = data.length > 0 ? Object.keys(data[0]).filter(key => key !== '_id' && key !== '__v') : [];

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    const isDate = (value: any): boolean => {
        // Verifica se é uma instância de Date
        if (value instanceof Date) {
            return true;
        }
        // Verifica se é uma string e se pode ser convertida em uma data válida
        const date = new Date(value);
        return !isNaN(date.getTime());
    };

    return (
        <Table striped bordered hover responsive>
            <thead>
            <tr>
                {columns.map((column, index) => <th key={index}>{column}</th>)}
                {(onDelete || onEdit) && <th>Ações</th>} {/* Updated condition for Ações header */}
            </tr>
            </thead>
            <tbody>
            {data.map(item => (
                <tr key={item._id}>
                    {columns.map((column, index) => (
                        <td key={`${item._id}-${index}`}>
                            {column === 'name' ? (
                                <Link to={`/${entityName}s/${item._id}`}>{item[column]}</Link>
                            ) : isDate(item[column]) ? ( // Verifica se o item[column] é uma data
                                formatDate(item[column])
                            ) : (
                                typeof item[column] === 'object'
                                    ? (Array.isArray(item[column])
                                        ? (item[column]?.map((o: any) => o.name).join(", ") || '-')
                                        : (item[column]?.name || '-'))
                                    : item[column]
                            )}
                        </td>
                    ))}
                    {(onDelete || onEdit) && ( // Updated condition for Ações cell
                        <td>
                            {onEdit && (
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => onEdit(item._id)}
                                    className="me-2"
                                >
                                    Editar
                                </Button>
                            )}
                            {onDelete && (
                                <Button variant="danger" size="sm" onClick={() => onDelete(item._id)}>
                                    Excluir
                                </Button>
                            )}
                        </td>
                    )}
                </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length + ((onDelete || onEdit) ? 1 : 0)} className="text-center"> {/* Updated colSpan */}
                        Nenhum {entityName} encontrado.
                    </td>
                </tr>
            )}
            </tbody>
        </Table>
    );
};

export default EntityTable;
