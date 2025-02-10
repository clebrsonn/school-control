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
    action?: (id: string) => void;
}

const EntityTable = <T extends IEntity>({ data, entityName, onDelete, action }: EntityTableProps<T>) => {
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
            {(action || onDelete) && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              {columns.map((column, index) => (
                <td key={`${item._id}-${index}`}>
                  {column === 'name' ? (
                    <Link to={`/${entityName}s/${item._id}`}>{item[column]}</Link>
                  ) : (
                    typeof item[column] === 'object'
                      ? (Array.isArray(item[column])
                          ? (item[column]?.map((o: any) => o.name).join(", ") || '-')
                          : (item[column]?.name || '-'))
                      : item[column]
                  )}
                </td>
              ))}
                <td>

                {onDelete && (
                  <Button variant="danger" size="sm" onClick={() => onDelete(item._id)}>
                    Excluir
                  </Button>
                )}
                    {action && (

                    <Button variant="primary" size="sm" onClick={() => action(item._id)}>
                        Marcar como pago
                    </Button>
                    )}

                </td>

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