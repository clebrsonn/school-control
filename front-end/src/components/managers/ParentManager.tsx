// filepath: /e:/IdeaProjects/school-control/frontend/src/components/ParentManager.tsx
import React, { useState, useEffect } from 'react';
import { fetchParents, addParent } from '@services/ParentService';
import { Link } from 'react-router-dom';
import ErrorMessage from '@components/ErrorMessage';
import notification from '@components/Notification';
import { Button, Container, Form, Stack } from 'react-bootstrap';

const ParentManager: React.FC = () => {
  const [parents, setParents] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getParents = async () => {
      try {
        const parents = await fetchParents();
        setParents(parents);
      } catch (err) {
        setError(err.message || 'Failed to fetch parents');
      }
    };
    getParents();
  }, []);

  const handleAddParent = async () => {
    try {
      const newParent = { nome: name };
      const addedParent = await addParent(newParent);
      setParents([...parents, addedParent]);
      setName('');
      setError(null);
    } catch (err: any) {
      notification(err.message, 'error');
      setError(err.message || 'Failed to add parent');
    }
  };

  return (
    <Stack gap={3}>
      <h1>Gerenciar Responsável</h1>
      <ErrorMessage message={error} />
      
      <Form.Control
        type="text"
        placeholder="Nome Responsável"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={handleAddParent}>Salvar</Button>
      
      <ul>
        {parents.map((parent: any) => (
          <li key={parent._id}>
            <Link to={`/parents/${parent._id}`}>{parent.nome}</Link>
          </li>
        ))}
      </ul>
    </Stack>
  );
};

export default ParentManager;