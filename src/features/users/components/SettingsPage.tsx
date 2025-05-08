import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Nav, Row, Tab } from 'react-bootstrap';
import { FaBell, FaCog, FaPalette, FaSave, FaShieldAlt } from 'react-icons/fa';
import { getUserSettings, updateUserSettings } from '../services/UserService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import notification from '../../../components/common/Notification';
import { extractFieldErrors } from '../../../utils/errorUtils';

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      paymentReminders: true,
      systemUpdates: true
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false
    },
    privacy: {
      shareData: false,
      showOnlineStatus: true
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const userSettings = await getUserSettings();

        // If the backend returns settings, use them, otherwise keep defaults
        if (userSettings && Object.keys(userSettings).length > 0) {
          setSettings(userSettings);
        }
      } catch (err: any) {
        notification('Erro ao carregar configurações', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked
      }
    }));
  };

  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [name]: newValue
      }
    }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      setFieldErrors({});

      await updateUserSettings(settings);

      setSuccess(true);
      notification('Configurações atualizadas com sucesso!', 'success');
    } catch (err: any) {
      // Extract field-specific errors
      const errors = extractFieldErrors(err);
      setFieldErrors(errors);

      // If there are no field-specific errors, set a general error message
      if (Object.keys(errors).length === 0) {
        setError(err.message || 'Erro ao atualizar configurações');
      }

      notification('Erro ao atualizar configurações', 'error');
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
          <FaCog className="me-2" />
          Configurações
        </h1>
      </div>

      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Configurações atualizadas com sucesso!</Alert>}

          <Tab.Container defaultActiveKey="notifications">
            <Row>
              <Col md={3}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="notifications" className="d-flex align-items-center">
                      <FaBell className="me-2" />
                      Notificações
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="appearance" className="d-flex align-items-center">
                      <FaPalette className="me-2" />
                      Aparência
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="privacy" className="d-flex align-items-center">
                      <FaShieldAlt className="me-2" />
                      Privacidade
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>

              <Col md={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="notifications">
                    <h4 className="mb-3">Configurações de Notificações</h4>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="emailNotifications"
                          name="emailNotifications"
                          label="Receber notificações por email"
                          checked={settings.notifications.emailNotifications}
                          onChange={handleNotificationChange}
                          isInvalid={!!fieldErrors['notifications.emailNotifications']}
                        />
                        <Form.Text className="text-muted">
                          Receba atualizações importantes por email.
                        </Form.Text>
                        {fieldErrors['notifications.emailNotifications'] && (
                          <div className="text-danger mt-1">
                            {fieldErrors['notifications.emailNotifications']}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="pushNotifications"
                          name="pushNotifications"
                          label="Notificações push"
                          checked={settings.notifications.pushNotifications}
                          onChange={handleNotificationChange}
                          isInvalid={!!fieldErrors['notifications.pushNotifications']}
                        />
                        <Form.Text className="text-muted">
                          Receba notificações no navegador.
                        </Form.Text>
                        {fieldErrors['notifications.pushNotifications'] && (
                          <div className="text-danger mt-1">
                            {fieldErrors['notifications.pushNotifications']}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="paymentReminders"
                          name="paymentReminders"
                          label="Lembretes de pagamento"
                          checked={settings.notifications.paymentReminders}
                          onChange={handleNotificationChange}
                          isInvalid={!!fieldErrors['notifications.paymentReminders']}
                        />
                        <Form.Text className="text-muted">
                          Receba lembretes sobre pagamentos pendentes.
                        </Form.Text>
                        {fieldErrors['notifications.paymentReminders'] && (
                          <div className="text-danger mt-1">
                            {fieldErrors['notifications.paymentReminders']}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="systemUpdates"
                          name="systemUpdates"
                          label="Atualizações do sistema"
                          checked={settings.notifications.systemUpdates}
                          onChange={handleNotificationChange}
                          isInvalid={!!fieldErrors['notifications.systemUpdates']}
                        />
                        <Form.Text className="text-muted">
                          Receba notificações sobre atualizações do sistema.
                        </Form.Text>
                        {fieldErrors['notifications.systemUpdates'] && (
                          <div className="text-danger mt-1">
                            {fieldErrors['notifications.systemUpdates']}
                          </div>
                        )}
                      </Form.Group>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="appearance">
                    <h4 className="mb-3">Configurações de Aparência</h4>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Tema</Form.Label>
                        <Form.Select 
                          name="theme"
                          value={settings.appearance.theme}
                          onChange={handleAppearanceChange}
                          isInvalid={!!fieldErrors['appearance.theme']}
                        >
                          <option value="light">Claro</option>
                          <option value="dark">Escuro</option>
                          <option value="system">Usar configuração do sistema</option>
                        </Form.Select>
                        {fieldErrors['appearance.theme'] && (
                          <Form.Control.Feedback type="invalid">
                            {fieldErrors['appearance.theme']}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Tamanho da fonte</Form.Label>
                        <Form.Select 
                          name="fontSize"
                          value={settings.appearance.fontSize}
                          onChange={handleAppearanceChange}
                          isInvalid={!!fieldErrors['appearance.fontSize']}
                        >
                          <option value="small">Pequeno</option>
                          <option value="medium">Médio</option>
                          <option value="large">Grande</option>
                        </Form.Select>
                        {fieldErrors['appearance.fontSize'] && (
                          <Form.Control.Feedback type="invalid">
                            {fieldErrors['appearance.fontSize']}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="compactMode"
                          name="compactMode"
                          label="Modo compacto"
                          checked={settings.appearance.compactMode}
                          onChange={handleAppearanceChange}
                          isInvalid={!!fieldErrors['appearance.compactMode']}
                        />
                        <Form.Text className="text-muted">
                          Reduz o espaçamento entre elementos para mostrar mais conteúdo.
                        </Form.Text>
                        {fieldErrors['appearance.compactMode'] && (
                          <div className="text-danger mt-1">
                            {fieldErrors['appearance.compactMode']}
                          </div>
                        )}
                      </Form.Group>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="privacy">
                    <h4 className="mb-3">Configurações de Privacidade</h4>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="shareData"
                          name="shareData"
                          label="Compartilhar dados de uso anônimos"
                          checked={settings.privacy.shareData}
                          onChange={handlePrivacyChange}
                          isInvalid={!!fieldErrors['privacy.shareData']}
                        />
                        <Form.Text className="text-muted">
                          Ajude-nos a melhorar o sistema compartilhando dados anônimos de uso.
                        </Form.Text>
                        {fieldErrors['privacy.shareData'] && (
                          <div className="text-danger mt-1">
                            {fieldErrors['privacy.shareData']}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="showOnlineStatus"
                          name="showOnlineStatus"
                          label="Mostrar status online"
                          checked={settings.privacy.showOnlineStatus}
                          onChange={handlePrivacyChange}
                          isInvalid={!!fieldErrors['privacy.showOnlineStatus']}
                        />
                        <Form.Text className="text-muted">
                          Permite que outros usuários vejam quando você está online.
                        </Form.Text>
                        {fieldErrors['privacy.showOnlineStatus'] && (
                          <div className="text-danger mt-1">
                            {fieldErrors['privacy.showOnlineStatus']}
                          </div>
                        )}
                      </Form.Group>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>

          <div className="d-flex justify-content-end mt-4">
            <Button 
              variant="primary" 
              onClick={handleSubmit}
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
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsPage;
