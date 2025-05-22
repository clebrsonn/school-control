import React from 'react';

/**
 * @interface ErrorMessageProps
 * Props for the ErrorMessage component.
 */
interface ErrorMessageProps {
  /**
   * The error message string to display. If null or empty, the component will not render.
   * This message should be pre-translated before being passed to this component.
   * @type {string | null}
   */
  message: string | null;
}

/**
 * ErrorMessage is a functional component that displays a styled error message.
 * It includes a warning icon and the provided message text.
 * If the message is null or empty, the component does not render.
 *
 * @param {ErrorMessageProps} props - The props for the component.
 * @returns {React.ReactElement | null} A div containing the styled error message, or null.
 */
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
