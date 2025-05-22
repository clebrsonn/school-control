import { AxiosError } from 'axios';
import i18n from '../i18n'; // Import the i18n instance

/**
 * Extracts field-specific error messages from an API error response.
 * This function attempts to handle various common error response formats.
 *
 * @param {unknown} error - The error object, typically an AxiosError.
 * @returns {Record<string, string>} An object mapping field names to their corresponding error messages.
 *   Returns an empty object if no field-specific errors can be extracted.
 */
export const extractFieldErrors = (error: unknown): Record<string, string> => {
  if (!error) return {};

  const axiosError = error as AxiosError<any>;

  // If there's no response or data, or if data is not an object, return empty.
  if (!axiosError.response?.data || typeof axiosError.response.data !== 'object') {
    return {};
  }
  
  const { data } = axiosError.response;

  // Format 1: { errors: { field1: ['error1', 'error2'], field2: ['error3'] } } (Common in Spring Validation)
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const fieldErrors: Record<string, string> = {};
    Object.entries(data.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
        fieldErrors[field] = messages[0]; // Take the first message
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    });
    if (Object.keys(fieldErrors).length > 0) return fieldErrors;
  }

  // Format 2: { fieldErrors: [{ field: 'field1', message: 'error1' }, ...] } (Another common backend pattern)
  if (data.fieldErrors && Array.isArray(data.fieldErrors)) {
    const fieldErrorsResult = data.fieldErrors.reduce((acc: Record<string, string>, curr: any) => {
      if (curr && typeof curr.field === 'string' && typeof curr.message === 'string') {
        acc[curr.field] = curr.message;
      }
      return acc;
    }, {});
    if (Object.keys(fieldErrorsResult).length > 0) return fieldErrorsResult;
  }

  // Format 3: { fieldErrors: { field1: 'error1', field2: 'error2' } } (Direct object map)
  if (data.fieldErrors && typeof data.fieldErrors === 'object' && !Array.isArray(data.fieldErrors)) {
    // Ensure values are strings
    const fieldErrorsMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(data.fieldErrors)) {
        if (typeof value === 'string') {
            fieldErrorsMap[key] = value;
        }
    }
    if (Object.keys(fieldErrorsMap).length > 0) return fieldErrorsMap;
  }
  
  // Format 4: Direct field-error pairs in the data object, excluding common non-field error keys.
  // Example: { "username": "Username is required", "email": "Email is invalid", "message": "General error message" }
  // This is a more generic fallback and might capture unintended fields if the error structure is very flat.
  if (typeof data === 'object' && data !== null) {
    const directFieldErrors: Record<string, string> = {};
    const commonErrorKeys = ['message', 'error', 'status', 'timestamp', 'path', 'detail', 'title', 'type']; // common general error keys to exclude
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' && !commonErrorKeys.includes(key.toLowerCase())) {
        directFieldErrors[key] = value;
      }
    });
    if (Object.keys(directFieldErrors).length > 0) return directFieldErrors;
  }

  return {}; // Return empty if no specific field errors are found
}

/**
 * Extracts a user-friendly error message from an AxiosError or a generic Error object.
 * It prioritizes messages from the backend response data (e.g., `data.message`, `data.error`),
 * then falls back to `response.statusText`, and finally to the error's `message` property.
 * If no specific message can be extracted, it returns a translated generic error message.
 *
 * @param {unknown} error - The error object (AxiosError, Error, or other).
 * @returns {string} A user-friendly error message.
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return i18n.t('utils.error.unknownError'); // Translated default

  const axiosError = error as AxiosError<any>;

  // Check for backend-provided message in response data
  if (axiosError.response?.data) {
    const data = axiosError.response.data;
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    if (data.error && typeof data.error === 'string') { // Common for Spring Boot error details
      return data.error;
    }
    if (data.detail && typeof data.detail === 'string') { // Another common Spring Boot error field
        return data.detail;
    }
    // Add more checks for other common backend error message structures if needed
  }

  // Fallback to response status text if available
  if (axiosError.response?.statusText && typeof axiosError.response.statusText === 'string') {
    return `${axiosError.response.status}: ${axiosError.response.statusText}`;
  }
  
  // Fallback to generic Error message property
  if ((error as Error).message && typeof (error as Error).message === 'string') {
    return (error as Error).message;
  }

  // Final fallback to a generic translated error message
  return i18n.t('utils.error.unexpectedError'); // Translated default
};

