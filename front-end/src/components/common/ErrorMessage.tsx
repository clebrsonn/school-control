import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface ErrorMessageProps {
    error: Error;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
    const [showDetails, setShowDetails] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(error.stack || error.message);
    };

    return (
        <Alert variant="danger" className="mt-3">
            <Alert.Heading>Ocorreu um erro!</Alert.Heading>
            <p>
                {error.message || 'Um erro inesperado aconteceu. Por favor, tente novamente mais tarde.'}
            </p>
            {showDetails && (
                <pre style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ccc',
                    padding: '10px',
                    borderRadius: '5px',
                    overflowX: 'auto'
                }}>
                    {error.stack}
                </pre>
            )}
            <div className="d-flex justify-content-between">
                <div>
                    <Button variant="outline-danger" onClick={() => setShowDetails(!showDetails)}>
                        {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
                    </Button>
                    {onRetry && (
                        <Button variant="danger" onClick={onRetry} className="ms-2">
                            Recarregar
                        </Button>
                    )}
                </div>
                <Button variant="outline-secondary" onClick={copyToClipboard}>
                    Copiar Mensagem
                </Button>
            </div>
        </Alert>
    );
};

export default ErrorMessage;