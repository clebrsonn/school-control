import React, { useEffect, useState } from "react";
import { Button, Form, Table, Alert } from "react-bootstrap";
import { IClass } from "@hyteck/shared";
import { fetchClasses, createClass, deleteClass } from "@services/ClassService";

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const getClasses = async () => {
      try {
        const fetchedClasses = await fetchClasses();
        setClasses(fetchedClasses);
      } catch {
        setError("Erro ao carregar as turmas.");
      }
    };
    getClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Por favor, insira o nome da turma.");
      return;
    }
    try {
      const newClass = await createClass({ name });
      setClasses([...classes, newClass]);
      setName("");
      setSuccessMessage("Turma criada com sucesso!");
    } catch {
      setError("Erro ao criar a turma.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClass(id);
      setClasses(classes.filter((clazz) => clazz._id !== id));
      setSuccessMessage("Turma removida com sucesso.");
    } catch {
      setError("Erro ao remover a turma.");
    }
  };

  return (
      <div>
        <h2>Gerenciamento de Turmas</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="className">
            <Form.Label>Nome da Turma</Form.Label>
            <Form.Control
                type="text"
                placeholder="Exemplo: Turma A"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" className="mt-3">
            Adicionar Turma
          </Button>
        </Form>

        <h3 className="mt-4">Lista de Turmas</h3>
        <Table striped bordered hover>
          <thead>
          <tr>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          {classes.map((clazz) => (
              <tr key={clazz._id}>
                <td>{clazz.name}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDelete(clazz._id)}>
                    Excluir
                  </Button>
                </td>
              </tr>
          ))}
          </tbody>
        </Table>
      </div>
  );
};

export default ClassManager;