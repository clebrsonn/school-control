import { describe, expect, it } from 'vitest';
import { extractFieldErrors } from './errorUtils';
import { AxiosError } from 'axios';

describe('errorUtils', () => {
  describe('extractFieldErrors', () => {
    it('should extract field errors from Format 1: { errors: { field1: ["error1"] } }', () => {
      const error = {
        response: {
          data: {
            errors: {
              name: ['Name is required'],
              email: ['Invalid email format']
            }
          }
        }
      } as unknown as AxiosError;

      const result = extractFieldErrors(error);
      
      expect(result).toEqual({
        name: 'Name is required',
        email: 'Invalid email format'
      });
    });

    it('should extract field errors from Format 2: { fieldErrors: [{ field: "field1", message: "error1" }] }', () => {
      const error = {
        response: {
          data: {
            fieldErrors: [
              { field: 'name', message: 'Name is required' },
              { field: 'email', message: 'Invalid email format' }
            ]
          }
        }
      } as unknown as AxiosError;

      const result = extractFieldErrors(error);
      
      expect(result).toEqual({
        name: 'Name is required',
        email: 'Invalid email format'
      });
    });

    it('should extract field errors from Format 3: { field1: "error1", field2: "error2" }', () => {
      const error = {
        response: {
          data: {
            name: 'Name is required',
            email: 'Invalid email format',
            message: 'Validation error',
            status: 400
          }
        }
      } as unknown as AxiosError;

      const result = extractFieldErrors(error);
      
      expect(result).toEqual({
        name: 'Name is required',
        email: 'Invalid email format'
      });
    });

    it('should extract field errors from Format 4: { fieldErrors: { field1: "error1", field2: "error2" } }', () => {
      const error = {
        response: {
          data: {
            timestamp: "2025-05-03T10:47:16.356644300Z",
            status: 400,
            error: "Bad Request",
            message: "Erro de validação. Verifique os campos.",
            path: "/classrooms",
            fieldErrors: {
              name: "O tamanho deve estar entre 2 e 2147483647.",
              schoolYear: "deve corresponder a \"^\\d{4}$\""
            }
          }
        }
      } as unknown as AxiosError;

      const result = extractFieldErrors(error);
      
      expect(result).toEqual({
        name: "O tamanho deve estar entre 2 e 2147483647.",
        schoolYear: "deve corresponder a \"^\\d{4}$\""
      });
    });

    it('should return empty object if no errors are found', () => {
      const error = {
        response: {
          data: {
            message: 'General error message',
            status: 400
          }
        }
      } as unknown as AxiosError;

      const result = extractFieldErrors(error);
      
      expect(result).toEqual({});
    });

    it('should return empty object if error is null', () => {
      const result = extractFieldErrors(null);
      
      expect(result).toEqual({});
    });

    it('should return empty object if response is missing', () => {
      const error = {} as unknown as AxiosError;

      const result = extractFieldErrors(error);
      
      expect(result).toEqual({});
    });
  });
});