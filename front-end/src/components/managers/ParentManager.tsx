import React, { useState, useEffect } from 'react';
import { fetchParents, createParent } from '@services/ParentService';
import { Link } from 'react-router-dom';
import ErrorMessage from '@components/ErrorMessage';
import notification from '@components/Notification';
import {Button, Form, Table} from 'react-bootstrap';
import { IResponsible } from '@hyteck/shared';
import {deleteParent} from "../../services/ParentService.ts";

const ParentManager: React.FC = () => {
  const [parents, setParents] = useState<IResponsible[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('N/A');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getParents = async () => {
      try {
        const parents = await fetchParents();
        setParents(parents);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch parents');
      }
    };
    getParents();
  }, []);

  const handleAddParent = async () => {
    try {
      const newParent = { name, email, phone, students: [] };
      const addedParent = await createParent(newParent);
      setParents([...parents, addedParent]);
      setName('');
      setEmail('');
      setPhone('');
      setError(null);
      notification('Parent added successfully', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to add parent');
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteParent(id);
      setParents(parents.filter((parent) => parent._id !== id));
      notification("Responsável removido com sucesso.");
    } catch {
      setError("Erro ao remover o responsável.");
    }
  };


  return (
    <div>
      <h1>Gerenciar Responsáveis</h1>
      {error && <ErrorMessage message={error} />}
      <Form>
        <Form.Group controlId="formParentName">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        {/*<Form.Group controlId="formParentEmail">*/}
        {/*  <Form.Label>E-mail</Form.Label>*/}
        {/*  <Form.Control*/}
        {/*    type="email"*/}
        {/*    placeholder="Email"*/}
        {/*    value={email}*/}
        {/*    onChange={(e) => setEmail(e.target.value)}*/}
        {/*  />*/}
        {/*</Form.Group>*/}
        <Form.Group controlId="formParentPhone">
          <Form.Label>Telefone</Form.Label>
          <Form.Control
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleAddParent} className="mt-3">
          Save
        </Button>
      </Form>
      <h2>Parents List</h2>
      <Table striped bordered hover responsive>
        <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Ações</th>
        </tr>
        </thead>
        <tbody>
        {parents?.map((parent) => (
            <tr key={parent._id}>
              <td>
                <Link to={`/parents/${parent._id}`}>{parent.name}</Link>
              </td>
              <td>{parent.phone}</td>
              <td>
                <Button
                    variant="danger"
                    onClick={() => handleDelete(parent._id)}
                    size="sm"
                >
                  Excluir
                </Button>
              </td>
            </tr>
        ))}
        {parents.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center">
                Nenhum responsável encontrado.
              </td>
            </tr>
        )}
        </tbody>
      </Table>
    </div>
  );
};

export default ParentManager;