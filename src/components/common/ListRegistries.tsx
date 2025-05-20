import React from 'react';
import { Button, Pagination, Table } from 'react-bootstrap';
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
                                            page, entityName, onDelete, onEdit, onPageChange
                                        }: EntityTableProps<T>) => {
    const { content, number, totalPages } = page;
    const currentPage = number ? number + 1 : 1; // tornado 1-based para exibição

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

    return (
        <>
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
                    {content && content.map(entity => (
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
                                    >
                                        Editar
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => onDelete(entity.id)}
                                    >
                                        Excluir
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {totalPages > 1 && onPageChange && (
                <Pagination className="justify-content-center">
                    <Pagination.First
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    />
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    />
                </Pagination>
            )}
        </>
    );
};

export default ListRegistries;
