import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * @interface FormFieldProps
 * Props for the FormField component.
 * Defines the properties required to render a form field with a label, input,
 * and optional error message display.
 */
interface FormFieldProps {
  /**
   * A unique identifier for the form field, used for the `controlId` of `Form.Group` and `id` of `Form.Control`.
   * @type {string}
   */
  id: string;
  /**
   * The label text for the form field. This should be pre-translated.
   * @type {string}
   */
  label: string;
  /**
   * The type of the input field (e.g., 'text', 'email', 'password', 'number', 'date').
   * Defaults to 'text'.
   * @type {string}
   * @optional
   */
  type?: string;
  /**
   * Placeholder text for the input field. This should be pre-translated.
   * @type {string}
   * @optional
   */
  placeholder?: string;
  /**
   * The current value of the input field.
   * @type {string}
   */
  value: string;
  /**
   * Callback function triggered when the value of the input field changes.
   * @type {(e: React.ChangeEvent<HTMLInputElement>) => void}
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * An optional error message to display below the input field.
   * If provided, the field will be styled as invalid. This should be pre-translated.
   * @type {string | null}
   * @optional
   */
  error?: string | null;
  /**
   * Indicates if the field is required. If true, an asterisk (*) is displayed next to the label.
   * Defaults to false.
   * @type {boolean}
   * @optional
   */
  required?: boolean;
  /**
   * Indicates if the field is disabled.
   * Defaults to false.
   * @type {boolean}
   * @optional
   */
  disabled?: boolean;
  /**
   * Optional additional CSS class names to apply to the `Form.Group` element.
   * @type {string}
   * @optional
   */
  className?: string;
  /**
   * Optional name attribute for the input field. Useful for form submission and state management.
   * @type {string}
   * @optional
   */
  name?: string;
}

/**
 * FormField is a reusable functional component that standardizes the rendering of form fields
 * using React Bootstrap components. It includes a label, an input control, and optional display
 * of validation error messages and a required field indicator.
 *
 * All text props like `label`, `placeholder`, and `error` are expected to be pre-translated
 * before being passed to this component.
 *
 * @param {FormFieldProps} props - The props for the component.
 * @returns {React.ReactElement} A React Bootstrap Form.Group element containing the form field.
 */
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  name, // Added name to destructuring
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <Form.Group className={`mb-3 ${className}`} controlId={id}>
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <Form.Control
        name={name || id} // Use name prop if provided, otherwise fallback to id
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        isInvalid={!!error}
      />
      {error && (
        <Form.Control.Feedback type="invalid" data-testid={`error-${name || id}`}>
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default FormField;