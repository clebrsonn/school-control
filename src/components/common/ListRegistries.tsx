import React, { useState } from 'react';
import { Button, Form, Pagination, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * @interface IEntity
 * Represents a generic entity with an ID.
 * Used by ListRegistries to ensure entities have an 'id' property.
 */
interface IEntity {
    id: string;
    [key: string]: any; // Allows for other properties of any type
}

/**
 * @interface Page
 * Represents a paginated response from an API.
 * @template T - The type of the content in the page, must extend IEntity.
 */
interface Page<T extends IEntity> {
    content: T[];        // Array of entities for the current page
    number: number;      // Current page number (usually 0-indexed from backend)
    totalPages: number;  // Total number of pages available
    size: number;        // Number of items per page
    totalElements?: number; // Optional: total number of elements across all pages
}

/**
 * @interface EntityTableProps
 * Props for the ListRegistries component.
 * @template T - The type of the entities being listed, must extend IEntity.
 */
interface EntityTableProps<T extends IEntity> {
    /** The paginated data to display. */
    page: Page<T>;
    /** The name of the entity type (e.g., "students", "classes"). Used for routing and i18n keys. */
    entityName: string;
    /** Optional callback function triggered when a delete action is requested for an entity. */
    onDelete?: (id: string) => void;
    /** Optional callback function triggered when an edit action is requested for an entity. */
    onEdit?: (entity: T) => void;
    /** Optional callback function triggered when the page number changes through pagination controls. */
    onPageChange?: (page: number) => void;
}

/**
 * ListRegistries is a generic component designed to display a paginated table of entities.
 * It supports local search, dynamic header generation, and actions like edit/delete if callbacks are provided.
 * Internationalization is used for static text elements.
 *
 * @template T - The type of the entity, constrained to objects with an 'id' property.
 * @param {EntityTableProps<T>} props - The props for the component.
 * @returns {React.ReactElement} A table displaying the list of entities with search and pagination.
 */
const ListRegistries = <T extends IEntity>({
    page,
    entityName,
    onDelete,
    onEdit,
    onPageChange
}: EntityTableProps<T>) => {
    const { t } = useTranslation();
    // Ensure safe default for page prop to prevent runtime errors if page is undefined
    const safePage = page || { content: [], number: 0, totalPages: 1, size: 10 };
    const { content, number, totalPages } = safePage;
    // Adjust page number for display (1-based) vs backend (0-based)
    const currentPage = number != null ? number + 1 : 1; // Default to 1 if number is undefined

    // State for local search term
    const [search, setSearch] = useState('');

    // Filter content based on local search term
    const filteredContent = search
        ? content.filter(entity =>
            Object.values(entity)
                .join(' ') // Concatenate all stringifiable values
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : content;

    /**
     * Generates table headers dynamically from the keys of the first entity in the content array.
     * Excludes common non-display keys like 'id', 'createdAt', 'updatedAt', and object-type values.
     * @returns {string[]} An array of strings representing the table headers.
     */
    const getHeaders = (): string[] => {
        if (!content || content.length === 0) return [];
        const entity = content[0];
        return Object.keys(entity).filter(key => 
            key !== 'id' &&
            key !== 'createdAt' &&
            key !== 'updatedAt' &&
            key !== 'password' && // Example: explicitly exclude sensitive fields
            typeof entity[key] !== 'object' && // Exclude nested objects/arrays for simple display
            typeof entity[key] !== 'function'  // Exclude functions if any
        );
    };

    const headers = getHeaders();
    
    /**
     * Translates a header key into a displayable string.
     * Attempts to use specific i18n keys (e.g., `tables.headers.students.responsibleName`)
     * and falls back to capitalizing and spacing the key.
     * @param {string} headerKey - The key of the header (e.g., "responsibleName").
     * @param {string} currentEntityName - The name of the current entity being listed (e.g., "students").
     * @returns {string} The translated or formatted header string.
     */
    const translateHeader = (headerKey: string, currentEntityName: string): string => {
        const specificKey = `tables.headers.${currentEntityName}.${headerKey}`;
        const genericKey = `tables.headers.common.${headerKey}`;
        const translated = t(specificKey);
        if (translated !== specificKey) return translated; // Specific key found
        
        const genericTranslated = t(genericKey);
        if (genericTranslated !== genericKey) return genericTranslated; // Generic key found

        // Fallback: Capitalize and space out camelCase or snake_case
        return headerKey
            .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
            .replace(/_/g, ' ')        // Replace underscores with spaces
            .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
    };


    /**
     * Handles page change events from the pagination component.
     * Calls the onPageChange prop if provided and if the page number is valid and different.
     * @param {number} pageNum - The new page number (1-based).
     */
    const handlePageChange = (pageNum: number) => {
        if (onPageChange && pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
            onPageChange(pageNum); // Parent component handles 0-based conversion if needed
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Control
                    type="text"
                    placeholder={t('listRegistries.searchPlaceholder', { entityName: t(`entities.${entityName}`, entityName) })}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 300 }}
                />
                <span className="text-muted small">
                    {t('listRegistries.pageInfo', { currentPage, totalPages })}
                </span>
            </div>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header}>{translateHeader(header, entityName)}</th>
                        ))}
                        <th>{t('listRegistries.actionsHeader')}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredContent && filteredContent.length > 0 ? (
                        filteredContent.map(entity => (
                            <tr key={entity.id}>
                                {headers.map((header, index) => (
                                    <td key={`${entity.id}-${header}`}>
                                        {index === 0 ? ( // Make the first column a link to details
                                            <Link to={`/${entityName}/${entity.id}`}>
                                                {typeof entity[header] === 'boolean'
                                                    ? entity[header] ? t('listRegistries.booleanYes') : t('listRegistries.booleanNo')
                                                    : String(entity[header] == null ? '' : entity[header])} 
                                            </Link>
                                        ) : (
                                            typeof entity[header] === 'boolean'
                                                ? entity[header] ? t('listRegistries.booleanYes') : t('listRegistries.booleanNo')
                                                : String(entity[header] == null ? '' : entity[header])
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
                                            aria-label={t('listRegistries.ariaEdit', { entityName: t(`entities.${entityName}`, entityName) })}
                                        >
                                            {t('listRegistries.editButton')}
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => onDelete(entity.id)}
                                            aria-label={t('listRegistries.ariaDelete', { entityName: t(`entities.${entityName}`, entityName) })}
                                        >
                                            {t('listRegistries.deleteButton')}
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length + 1} className="text-center text-muted">
                                {t('listRegistries.noRecordsFound')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && onPageChange && (
                <Pagination className="justify-content-center mt-3">
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {/* Consider a more sophisticated pagination item rendering for many pages */}
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
