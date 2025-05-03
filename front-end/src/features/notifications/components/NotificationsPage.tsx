import React, { useEffect } from 'react';
import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import { FaBell, FaCheck } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationProvider';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaBell className="me-2" />
          Notificações
          {unreadCount > 0 && (
            <Badge bg="danger" pill className="ms-2">
              {unreadCount}
            </Badge>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button 
            variant="outline-primary" 
            onClick={markAllAsRead}
            className="d-flex align-items-center"
          >
            <FaCheck className="me-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card>
        <Card.Body>
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={48} className="text-muted mb-3" />
              <h5>Não há notificações</h5>
              <p className="text-muted">Você será notificado quando houver novidades.</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map(notification => (
                <ListGroup.Item 
                  key={notification.id}
                  className={`border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                  action
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="d-flex">
                    <div className="me-3">
                      {!notification.isRead ? (
                        <Badge bg="primary" className="rounded-circle p-2" />
                      ) : (
                        <Badge bg="secondary" className="rounded-circle p-2 opacity-25" />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <h5 className="mb-1">{notification.title}</h5>
                        <small className="text-muted">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="mb-1">{notification.message}</p>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotificationsPage;