import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { FaSave, FaUser } from 'react-icons/fa';
import { useAuth } from '../../auth/contexts/AuthProvider';
import { updateUserProfile } from '../services/UserService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import notification from '../../../components/common/Notification';
import FormField from '../../../components/common/FormField';
import { extractFieldErrors } from '../../../utils/errorUtils';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      setFieldErrors({});

      await updateUserProfile(formData);

      setSuccess(true);
      notification('Perfil atualizado com sucesso!', 'success');
    } catch (err: any) {
      const errors = extractFieldErrors(err);
      setFieldErrors(errors);

      // If there are no field-specific errors, set a general error message
      if (Object.keys(errors).length === 0) {
        setError(err.message || 'Erro ao atualizar perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaUser className="me-2" />
          Meu Perfil
        </h1>
      </div>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Perfil atualizado com sucesso!</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormField
                      id="username"
                      label="Nome de Usuário"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange(e)}
                      error={fieldErrors.username || null}
                      disabled
                      className="mb-0"
                    />
                    <Form.Text className="text-muted mb-3 d-block">
                      O nome de usuário não pode ser alterado.
                    </Form.Text>
                  </Col>

                  <Col md={6}>
                    <FormField
                      id="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange(e)}
                      error={fieldErrors.email || null}
                      disabled
                      className="mb-0"
                    />
                    <Form.Text className="text-muted mb-3 d-block">
                      O email não pode ser alterado.
                    </Form.Text>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormField
                      id="name"
                      label="Nome Completo"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange(e)}
                      error={fieldErrors.name || null}
                      placeholder="Seu nome completo"
                    />
                  </Col>

                  <Col md={6}>
                    <FormField
                      id="phone"
                      label="Telefone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleChange(e)}
                      error={fieldErrors.phone || null}
                      placeholder="Seu telefone"
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Sobre Mim</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Uma breve descrição sobre você"
                    rows={3}
                    isInvalid={!!fieldErrors.bio}
                  />
                  {fieldErrors.bio && (
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.bio}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={saving}
                    className="d-flex align-items-center"
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <div className="text-center mb-3">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" 
                  style={{ width: '100px', height: '100px' }}
                >
                  <FaUser size={40} />
                </div>
                <h5>{formData.name || formData.username || formData.email}</h5>
                <p className="text-muted">{formData.email}</p>
              </div>

              <hr />

              <div>
                <h6>Informações da Conta</h6>
                <p className="mb-1">
                  <strong>Membro desde:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="mb-1">
                  <strong>Status:</strong> {user?.enabled ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;
