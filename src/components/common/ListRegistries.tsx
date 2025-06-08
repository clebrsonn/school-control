import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { FileEdit, Trash2 } from 'lucide-react'; // Icons for actions

interface IEntity {
    id: string;
    [key: string]: any;
}

interface Page<T> {
    content: T[];
    number: number; // 0-indexed
    totalPages: number;
    size: number;
    totalElements?: number;
}

interface ListRegistriesProps<T extends IEntity> {
    page: Page<T>;
    entityName: string; // Used for links and search placeholder
    onDelete?: (id: string) => void;
    onEdit?: (entity: T) => void;
    onPageChange?: (page: number) => void; // Expects 0-indexed page
    // Custom columns can be added here if dynamic header generation is not always desired
    // columns?: Array<{ accessor: keyof T | string; Header: string; Cell?: (data: T) => React.ReactNode }>;
}

const ListRegistries = <T extends IEntity>({
    page,
    entityName,
    onDelete,
    onEdit,
    onPageChange
}: ListRegistriesProps<T>) => {
    const safePage = page || { content: [], number: 0, totalPages: 1, size: 10 };
    const { content, number: zeroIndexedPageNumber, totalPages } = safePage;

    const [search, setSearch] = useState('');
    const filteredContent = search
        ? content.filter(entity =>
            Object.values(entity)
                .join(' ')
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : content;

    const getHeaders = () => {
        if (!content || content.length === 0) return [];
        const entity = content[0];
        // Filter out common/internal fields and objects/arrays for basic display
        return Object.keys(entity).filter(key => 
            key !== 'id' &&
            key !== 'createdAt' &&
            key !== 'updatedAt' &&
            key !== 'deletedAt' && // common soft delete field
            typeof entity[key] !== 'object' && // Exclude objects (like nested entities)
            !Array.isArray(entity[key]) // Exclude arrays
        ).slice(0, 5); // Limit to first 5 dynamic columns for better layout, can be configured
    };
    const headers = getHeaders();

    const handlePageChange = (pageNumZeroIndexed: number) => {
        if (onPageChange && pageNumZeroIndexed !== zeroIndexedPageNumber) {
            onPageChange(pageNumZeroIndexed);
        }
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(0, Math.min(zeroIndexedPageNumber - Math.floor(maxPagesToShow / 2), totalPages - maxPagesToShow));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow);

        if (startPage > 0) {
            items.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
        }
        for (let i = startPage; i < endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink href="#" onClick={(e) => {e.preventDefault(); handlePageChange(i);}} isActive={zeroIndexedPageNumber === i}>
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        if (endPage < totalPages) {
            items.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
        }
        return items;
    };


    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <Input
                    type="text"
                    placeholder={`Buscar em ${entityName}...`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                {totalPages > 0 && (
                     <p className="text-sm text-muted-foreground">
                        Página {zeroIndexedPageNumber + 1} de {totalPages}
                    </p>
                )}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map(header => (
                                <TableHead key={header} className="capitalize">{header.replace(/([A-Z])/g, ' $1')}</TableHead> // Add spaces to camelCase
                            ))}
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContent && filteredContent.length > 0 ? (
                            filteredContent.map(entity => (
                                <TableRow key={entity.id}>
                                    {headers.map((header, index) => (
                                        <TableCell key={`${entity.id}-${header}`}>
                                            {index === 0 && entityName !== 'discounts' ? ( // Make first column a link (except for discounts or as configured)
                                                <Link to={`/${entityName}/${entity.id}`} className="font-medium text-primary hover:underline">
                                                    {typeof entity[header] === 'boolean'
                                                        ? entity[header] ? 'Sim' : 'Não'
                                                        : String(entity[header] || '-')}
                                                </Link>
                                            ) : (
                                                typeof entity[header] === 'boolean'
                                                    ? entity[header] ? 'Sim' : 'Não'
                                                    : String(entity[header] || '-')
                                            )}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right space-x-2">
                                        {onEdit && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onEdit(entity)}
                                                title={`Editar ${entityName}`}
                                            >
                                                <FileEdit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => onDelete(entity.id)}
                                                title={`Excluir ${entityName}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Excluir</span>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={headers.length + 1} className="h-24 text-center text-muted-foreground">
                                    Nenhum registro encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && onPageChange && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(0)}
                                disabled={zeroIndexedPageNumber === 0}
                            >
                                Primeira
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {e.preventDefault(); handlePageChange(zeroIndexedPageNumber - 1);}}
                                className={zeroIndexedPageNumber === 0 ? "pointer-events-none opacity-50" : undefined}
                            />
                        </PaginationItem>
                        {renderPaginationItems()}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {e.preventDefault(); handlePageChange(zeroIndexedPageNumber + 1);}}
                                className={zeroIndexedPageNumber === totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
                             />
                        </PaginationItem>
                        <PaginationItem>
                             <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(totalPages - 1)}
                                disabled={zeroIndexedPageNumber === totalPages - 1}
                            >
                                Última
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default ListRegistries;
