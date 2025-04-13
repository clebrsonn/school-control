import React, { useState } from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

const ITEMS_PER_PAGE = 10;

interface IEntity {
  _id: string;
  [key: string]: any;
}

interface EntityTableProps<T extends IEntity> {
  data: T[];
  entityName: string;
  onDelete?: (id: string) => void;
}

const EntityTable = <T extends IEntity>({ data, entityName, onDelete }: EntityTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const columns = data.length > 0 ? Object.keys(data[0]).filter(key => key !== '_id' && key !== '__v') : [];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const isDate = (value: any): boolean => {
    if (value instanceof Date) {
      return true;
    }
    const date = new Date(value);
    return !isNaN(date.getTime());
  };

  const filteredData = data.filter(item =>
    columns.some(column => {
      const value = item[column];
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return value.some(obj =>
            obj?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return value?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const handlePageChange = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredData.slice(offset, offset + ITEMS_PER_PAGE);
  const pageCount = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  return (
    <>
      <Form.Control
        type="text"
        placeholder="Filtrar registros..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-3"
      />

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns.map((column, index) => <th key={index}>{column}</th>)}
            {onDelete && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {currentPageData.map(item => (
            <tr key={item._id}>
              {columns.map((column, index) => (
                <td key={`${item._id}-${index}`}>
                  {(() => {
                    const value = item[column];

                    if (item._id && column === 'name') {
                      return <Link to={`/${entityName}s/${item._id}`}>{value}</Link>;
                    }

                    if (isDate(value)) {
                      return formatDate(value);
                    }

                    if (Array.isArray(value) && value.every(obj => obj && obj.name)) {
                      return value.map(obj => obj.name).join(', ');
                    }

                    if (value && typeof value === 'object' && value.name) {
                      return <Link to={`/${entityName}s/${value._id}`}>{value.name}</Link>;
                    }

                    return String(value);
                  })()}
                </td>
              ))}
              {onDelete && (
                <td>
                  <Button variant="danger" size="sm" onClick={() => onDelete(item._id)}>
                    Excluir
                  </Button>
                </td>
              )}
            </tr>
          ))}
          {currentPageData.length === 0 && (
            <tr>
              <td colSpan={columns.length + (onDelete ? 1 : 0)} className="text-center">
                Nenhum {entityName} encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {filteredData.length > ITEMS_PER_PAGE && (
        <ReactPaginate
          previousLabel={'Anterior'}
          nextLabel={'Próximo'}
          breakLabel={'...'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
          pageClassName={'page-item'}
          pageLinkClassName={'page-link'}
          previousClassName={'page-item'}
          previousLinkClassName={'page-link'}
          nextClassName={'page-item'}
          nextLinkClassName={'page-link'}
          breakClassName={'page-item'}
          breakLinkClassName={'page-link'}
          forcePage={currentPage}
        />
      )}
    </>
  );
};

export default EntityTable;
