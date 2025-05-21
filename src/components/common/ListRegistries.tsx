import React, { useState } from 'react';
import { Button, Form, Pagination, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface IEntity {
    id: string;
    [key: string]: any;
}

interface Page<T> {
    content: T[];
    number: number;
    totalPages: number;
    size: number;
    totalElements?: number;
}

interface EntityTableProps<T extends IEntity> {
    page: Page<T>;
    entityName: string;
    onDelete?: (id: string) => void;
    onEdit?: (entity: T) => void;
    onPageChange?: (page: number) => void;
}

const ListRegistries = <T extends IEntity>({
    page,
    entityName,
    onDelete,
    onEdit,
    onPageChange
}: EntityTableProps<T>) => {
    // Garante valor padrão seguro para page
    const safePage = page || { content: [], number: 0, totalPages: 1, size: 10 };
    const { content, number, totalPages } = safePage;
    const currentPage = number ? number + 1 : 1;

    // Busca local
    const [search, setSearch] = useState('');
    const filteredContent = search
        ? content.filter(entity =>
            Object.values(entity)
                .join(' ')
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : content;

    // Get all keys from the first entity to use as table headers
    const getHeaders = () => {
        if (!content || content.length === 0) return [];
        const entity = content[0];
        return Object.keys(entity).filter(key => 
            key !== 'id' &&
            key !== 'createdAt' &&
            key !== 'updatedAt' &&
            typeof entity[key] !== 'object'
        );
    };

    const headers = getHeaders();

    // Paginação controlada por evento React, sem reload
    const handlePageChange = (pageNum: number) => {
        if (onPageChange && pageNum !== currentPage) {
            onPageChange(pageNum); // pageNum já é 1-based, backend espera 0-based, ajuste feito no pai
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Control
                    type="text"
                    placeholder={`Buscar ${entityName}...`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 300 }}
                />
                <span className="text-muted small">
                    Página {currentPage} de {totalPages}
                </span>
            </div>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header}>{header}</th>
                        ))}
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredContent && filteredContent.length > 0 ? (
                        filteredContent.map(entity => (
                            <tr key={entity.id}>
                                {headers.map((header, index) => (
                                    <td key={`${entity.id}-${header}`}>
                                        {index === 0 ? (
                                            <Link to={`/${entityName}/${entity.id}`}>
                                                {typeof entity[header] === 'boolean'
                                                    ? entity[header] ? 'Sim' : 'Não'
                                                    : String(entity[header] || '')}
                                            </Link>
                                        ) : (
                                            typeof entity[header] === 'boolean'
                                                ? entity[header] ? 'Sim' : 'Não'
                                                : String(entity[header] || '')
                                        )}
                                    </td>
                                ))}
                                <td>
                                    {onEdit && (
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => onEdit(entity)}
                                            className="me-2"
                                            aria-label={`Editar ${entityName}`}
                                        >
                                            Editar
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => onDelete(entity.id)}
                                            aria-label={`Excluir ${entityName}`}
                                        >
                                            Excluir
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length + 1} className="text-center text-muted">
                                Nenhum registro encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && onPageChange && (
                <Pagination className="justify-content-center mt-3">
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                            key={i + 1}
                            active={i + 1 === currentPage}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            )}
        </>
    );
};

export default ListRegistries;
