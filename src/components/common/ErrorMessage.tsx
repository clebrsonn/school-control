import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div style={{
      color: '#842029',
      background: '#f8d7da',
      border: '1px solid #f5c2c7',
      borderRadius: 4,
      padding: '0.75rem 1rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <span aria-hidden="true" style={{fontWeight: 'bold', fontSize: '1.2em'}}>⚠️</span>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
