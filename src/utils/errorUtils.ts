import { AxiosError } from 'axios';

/**
 * Extracts field errors from an API error response
 * @param error The axios error object
 * @returns An object mapping field names to error messages
 */
export const extractFieldErrors = (error: unknown): Record<string, string> => {
  if (!error) return {};

  const axiosError = error as AxiosError<any>;

  // If there's no response or data, return empty object
  if (!axiosError.response || !axiosError.response.data) return {};

  const { data } = axiosError.response;

  // Handle different error response formats

  // Format 1: { errors: { field1: ['error1', 'error2'], field2: ['error3'] } }
  if (data.errors && typeof data.errors === 'object') {
    const fieldErrors: Record<string, string> = {};

    Object.entries(data.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = messages[0];
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    });

    return fieldErrors;
  }

  // Format 2: { fieldErrors: [{ field: 'field1', message: 'error1' }, ...] }
  if (data.fieldErrors && Array.isArray(data.fieldErrors)) {
    return data.fieldErrors.reduce((acc: Record<string, string>, curr: { field: string, message: string }) => {
      acc[curr.field] = curr.message;
      return acc;
    }, {});
  }

  // Format 4: { fieldErrors: { field1: 'error1', field2: 'error2' } }
  if (data.fieldErrors && typeof data.fieldErrors === 'object' && !Array.isArray(data.fieldErrors)) {
    return data.fieldErrors;
  }

  // Format 3: { field1: 'error1', field2: 'error2' }
  // Check if data contains field-error pairs directly
  if (typeof data === 'object' && data !== null) {
    const fieldErrors: Record<string, string> = {};

    Object.entries(data).forEach(([key, value]) => {
      // Skip non-string values and common non-field properties
      if (typeof value === 'string' && 
          !['message', 'error', 'status', 'timestamp', 'path'].includes(key)) {
        fieldErrors[key] = value;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      return fieldErrors;
    }
  }

  return {};
};

/**
 * Gets a field error message if it exists
 * @param fieldName The name of the field
 * @param fieldErrors The object containing field errors
 * @returns The error message for the field or null
 */
export const getFieldError = (
  fieldName: string, 
  fieldErrors: Record<string, string> | null
): string | null => {
  if (!fieldErrors) return null;
  return fieldErrors[fieldName] || null;
};
