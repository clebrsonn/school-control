import React from 'react';
import { AlertTriangle } from 'lucide-react'; // Or another suitable icon like XCircle
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  message: string | null;
  title?: string; // Optional title
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, title }) => {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;
