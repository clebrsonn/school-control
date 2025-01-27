// filepath: /e:/IdeaProjects/school-control/front-end/src/components/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div style={{ color: 'red', marginBottom: '1rem' }}>
      {message}
    </div>
  );
};

export default ErrorMessage;